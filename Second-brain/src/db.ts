import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

mongoose.connect(
  "mongodb+srv://abhimanyutripathi2504:Abhi%401234@cluster0.eihawxr.mongodb.net/Second-Brain"
);
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
  type: { type: String, required: true },
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

export const UserModel = mongoose.model("User", UserSchema);
export const ContentModel = mongoose.model("Content", ContentSchema);
export const TagsModel = mongoose.model("Tag", TagSchema);
export const LinksModel = mongoose.model("Link", LinkSchema);
