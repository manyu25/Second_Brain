import { BrainIcon } from "../Icons/BrainIcon";
import { TwitterIcon } from "../Icons/TwitterIcon";
import { YoutubeIcon } from "../Icons/YouTubeIcon";
import { SidebarItem } from "./SidebarItem";

export function Sidebar() {
  return (
    <div className="h-screen bg-white border-r w-72 fixed left-0 top-0 pl-6">
      <div className="flex text-2xl text-purple-600 pt-8 items-center">
        <div className="pr-2">
          <BrainIcon />
        </div>
        Second Brain
      </div>
      <div className="pt-4 pl-4">
        <SidebarItem text="Twitter" icon={<TwitterIcon />} />
        <SidebarItem text="YouTube" icon={<YoutubeIcon />} />
      </div>
    </div>
  );
}
