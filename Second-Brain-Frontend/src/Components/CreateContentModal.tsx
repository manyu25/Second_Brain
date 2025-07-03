import { useRef, useState } from "react";
import { CrossIcon } from "../Icons/CrossIcon";
import { Button } from "./Button";
import { Input } from "./Input";
import { BACKEND_URL } from "../config";
import axios from "axios";

type CreateContentModalProps = {
  open: boolean;
  onClose: () => void;
};

const ContentType = {
  Youtube: "youtube",
  Twitter: "twitter",
} as const;
type ContentType = (typeof ContentType)[keyof typeof ContentType];

export function CreateContentModal({ open, onClose }: CreateContentModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<ContentType>(ContentType.Youtube);

  async function addContent() {
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;

    await axios.post(
      `${BACKEND_URL}/api/v1/content`,
      {
        link,
        title,
        type,
      },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    onClose();
  }

  return (
    <div>
      {open && (
        <div className="w-screen h-screen fixed top-0 left-0 flex justify-center items-center z-50">
          <div className="absolute inset-0 bg-slate-500 opacity-60"></div>

          <div className="relative bg-white p-6 rounded-md z-10 w-[90%] max-w-md shadow-lg">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 bg-slate-300 rounded-full p-2 hover:bg-slate-400 transition"
            >
              <CrossIcon size="lg" />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-center">
              Add Content
            </h2>

            <div className="space-y-3">
              <Input ref={titleRef} placeholder="Title" />
              <Input ref={linkRef} placeholder="Link" />
            </div>

            <div className="flex gap-4 mt-4 justify-center">
              <Button
                text="YouTube"
                variant={type === ContentType.Youtube ? "primary" : "secondary"}
                size="md"
                onClick={() => setType(ContentType.Youtube)}
              />

              <Button
                text="Twitter"
                variant={type === ContentType.Twitter ? "primary" : "secondary"}
                size="md"
                onClick={() => setType(ContentType.Twitter)}
              />
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="primary"
                text="Submit"
                size="md"
                onClick={addContent}
                fullwidth
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
