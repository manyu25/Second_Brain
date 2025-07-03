import express, { Request, Response } from "express";
// Extend Express Request interface to include userId
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcrypt";
import { ContentModel, LinksModel, UserModel } from "./db";
import { JWT_USER_SECRET } from "./config";
import { userMiddleware } from "./Middleware";
import { random } from "./utils";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/ping", (req, res) => {
  console.log("✅ /ping hit");
  res.json({ message: "pong" });
});

declare global {
  namespace Express {
    interface Request {
      userId?: mongoose.Types.ObjectId;
    }
  }
}

app.post("/api/v1/signup", async (req: Request, res: Response) => {
  const requiredBody = z.object({
    username: z.string().min(3).max(10),
    password: z
      .string()
      .min(8)
      .max(20)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
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
    const hashPassword = await bcrypt.hash(password, 5);
    await UserModel.create({
      username: username,
      password: hashPassword,
    });

    res.status(200).json({
      message: "You are signed up",
    });
  } catch (e) {
    console.log(e);
    res.status(403).json({
      message: "User Already Exists",
    });
  }
});

app.post("/api/v1/signin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const founduser = await UserModel.findOne({ username });

    if (!founduser) {
      return res.status(403).json({ message: "User Not Found" });
    }

    const passMatch = await bcrypt.compare(password, founduser.password);

    if (!passMatch) {
      return res.status(403).json({ message: "Incorrect Credentials" });
    }

    const token = jwt.sign({ id: founduser._id.toString() }, JWT_USER_SECRET);

    return res.status(200).json({
      message: "You are signed in",
      token,
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post(
  "/api/v1/content",
  userMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { link, type, title } = req.body;

      if (!link || !title || !type) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const content = await ContentModel.create({
        link,
        type,
        userId: (req as any).userId,
        tags: [],
        title,
      });

      res.json({ message: "Content Added", content });
    } catch (err) {
      console.error("Error in /api/v1/content:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

app.get(
  "/api/v1/content",
  userMiddleware,
  async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
      userId: userId,
    }).populate("userId", "username");

    res.json({
      content,
    });
  }
);

app.delete(
  "/api/v1/content",
  userMiddleware,
  async (req: Request, res: Response) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
      contentId,
      //@ts-ignore
      userId: req.userId,
    });

    res.json({
      message: "deleted",
    });
  }
);

app.post(
  "/api/v1/brain/share",
  userMiddleware,
  async (req: Request, res: Response) => {
    const share = req.body.share;
    const hash = random(10);
    if (share) {
      const existingLink = await LinksModel.findOne({
        userId: req.userId,
      });

      if (existingLink) {
        res.json({
          hash: existingLink.hash,
        });
        return;
      }
      await LinksModel.create({
        //@ts-ignore
        userId: req.userId,
        hash: hash,
      });

      res.json({
        message: "/share" + hash,
      });
    } else {
      await LinksModel.deleteOne({
        //@ts-ignore
        userId: req.userId,
      });
      res.json({
        message: "Removed Link",
      });
    }
  }
);

app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {
  const hash = req.params.shareLink;

  const link = await LinksModel.findOne({
    hash: hash,
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect input",
    });
    return;
  }

  const content = await ContentModel.find({
    userId: link.userId,
  });

  const user = await UserModel.findOne({
    _id: link.userId,
  });

  res.json({
    username: user?.username,
    content: content,
  });
});

mongoose
  .connect(
    "mongodb+srv://abhimanyutripathi2504:Abhi%401234@cluster0.eihawxr.mongodb.net/Second-Brain"
  )
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(3000, () => {
      console.log("🚀 Server is running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
