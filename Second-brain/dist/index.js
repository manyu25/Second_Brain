"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Extend Express Request interface to include userId
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const config_1 = require("./config");
const Middleware_1 = require("./Middleware");
const utils_1 = require("./utils");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/ping", (req, res) => {
    console.log("✅ /ping hit");
    res.json({ message: "pong" });
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.z.object({
        username: zod_1.z.string().min(3).max(10),
        password: zod_1.z
            .string()
            .min(8)
            .max(20)
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one digit")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    });
    const parsedDataWithSuccess = requiredBody.safeParse(req.body);
    if (!parsedDataWithSuccess.success) {
        return res.status(411).json({
            message: "Incorrect Format",
            error: parsedDataWithSuccess.error,
        });
    }
    const { username, password } = parsedDataWithSuccess.data;
    try {
        const hashPassword = yield bcrypt_1.default.hash(password, 5);
        yield db_1.UserModel.create({
            username: username,
            password: hashPassword,
        });
        res.status(200).json({
            message: "You are signed up",
        });
    }
    catch (e) {
        console.log(e);
        res.status(403).json({
            message: "User Already Exists",
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const founduser = yield db_1.UserModel.findOne({ username });
        if (!founduser) {
            return res.status(403).json({ message: "User Not Found" });
        }
        const passMatch = yield bcrypt_1.default.compare(password, founduser.password);
        if (!passMatch) {
            return res.status(403).json({ message: "Incorrect Credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: founduser._id.toString() }, config_1.JWT_USER_SECRET);
        return res.status(200).json({
            message: "You are signed in",
            token,
        });
    }
    catch (err) {
        console.error("Signin error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}));
app.post("/api/v1/content", Middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { link, type, title } = req.body;
        if (!link || !title || !type) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const content = yield db_1.ContentModel.create({
            link,
            type,
            userId: req.userId,
            tags: [],
            title,
        });
        res.json({ message: "Content Added", content });
    }
    catch (err) {
        console.error("Error in /api/v1/content:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
}));
app.get("/api/v1/content", Middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const content = yield db_1.ContentModel.find({
        userId: userId,
    }).populate("userId", "username");
    res.json({
        content,
    });
}));
app.delete("/api/v1/content", Middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    yield db_1.ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId,
    });
    res.json({
        message: "deleted",
    });
}));
app.post("/api/v1/brain/share", Middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    const hash = (0, utils_1.random)(10);
    if (share) {
        const existingLink = yield db_1.LinksModel.findOne({
            userId: req.userId,
        });
        if (existingLink) {
            res.json({
                hash: existingLink.hash,
            });
            return;
        }
        yield db_1.LinksModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash,
        });
        res.json({
            message: "/share" + hash,
        });
    }
    else {
        yield db_1.LinksModel.deleteOne({
            //@ts-ignore
            userId: req.userId,
        });
        res.json({
            message: "Removed Link",
        });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.LinksModel.findOne({
        hash: hash,
    });
    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input",
        });
        return;
    }
    const content = yield db_1.ContentModel.find({
        userId: link.userId,
    });
    const user = yield db_1.UserModel.findOne({
        _id: link.userId,
    });
    res.json({
        username: user === null || user === void 0 ? void 0 : user.username,
        content: content,
    });
}));
mongoose_1.default
    .connect("mongodb+srv://abhimanyutripathi2504:Abhi%401234@cluster0.eihawxr.mongodb.net/Second-Brain")
    .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
        console.log("🚀 Server is running on http://localhost:3000");
    });
})
    .catch((err) => {
    console.error("MongoDB connection error:", err);
});
