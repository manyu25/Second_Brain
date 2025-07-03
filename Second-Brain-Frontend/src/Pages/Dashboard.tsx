import { useState, useEffect } from "react";
import { Button } from "../Components/Button";
import { Card } from "../Components/Card";
import { CreateContentModal } from "../Components/CreateContentModal";
import { PlusIcon } from "../Icons/PlusIcon";
import { ShareIcon } from "../Icons/ShareIcon";
import { Sidebar } from "../Components/Sidebar";
import { useContent } from "../Hooks/useContent";
import axios from "axios";
import { BACKEND_URL, FRONTEND_URL } from "../config";

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { contents, refresh } = useContent();

  useEffect(() => {
    refresh();
  }, [modalOpen]);

  return (
    <div className="bg-gray-100">
      <Sidebar />
      <div className="p-4 ml-72 min-h-screen border-2">
        <CreateContentModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
        />
        <div className="flex justify-end gap-5">
          <Button
            startIcon={<ShareIcon size="md" />}
            variant="primary"
            size="md"
            onClick={async () => {
              const response = await axios.post(
                `${BACKEND_URL}/api/v1/brain/share`,
                {
                  share: true,
                },
                {
                  headers: {
                    Authorization: localStorage.getItem("token"),
                  },
                }
              );
              const shareUrl = `${FRONTEND_URL}${response.data.hash}`;
              alert(shareUrl);
            }}
            text="Share Brain"
          />
          <Button
            startIcon={<PlusIcon size="lg" />}
            variant="secondary"
            size="md"
            onClick={() => {
              setModalOpen(true);
            }}
            text="Add Content"
          />
        </div>
        <div className="flex gap-5 flex-wrap">
          {contents.map(({ _id, type, link, title }) => (
            <Card key={_id} type={type} link={link} title={title} />
          ))}
        </div>
      </div>
    </div>
  );
}
