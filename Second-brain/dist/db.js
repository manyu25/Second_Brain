"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinksModel = exports.TagsModel = exports.ContentModel = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const ObjectId = mongoose_1.default.Types.ObjectId;
mongoose_1.default.connect("mongodb+srv://abhimanyutripathi2504:Abhi%401234@cluster0.eihawxr.mongodb.net/Second-Brain");
console.log("Connected To DB");
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const contentTypes = [
    "image",
    "video",
    "article",
    "audio",
    "youtube",
    "twitter",
];
const ContentSchema = new Schema({
    link: { type: String, required: true },
    type: { type: String, enum: contentTypes, required: true },
    title: { type: String, required: true },
    tags: [{ type: ObjectId, ref: "Tag" }],
    userId: { type: ObjectId, ref: "User", required: true },
});
const TagSchema = new Schema({
    title: { type: String, required: true, unique: true },
});
const LinkSchema = new Schema({
    hash: { type: String, required: true },
    userId: { type: ObjectId, ref: "User", required: true, unique: true },
});
exports.UserModel = mongoose_1.default.model("User", UserSchema);
exports.ContentModel = mongoose_1.default.model("Content", ContentSchema);
exports.TagsModel = mongoose_1.default.model("Tag", TagSchema);
exports.LinksModel = mongoose_1.default.model("Link", LinkSchema);
