"use client";

import type { Video } from "@cineai/domain-types";
import { Icons } from "./Icons";
import Thumb from "./Thumb";

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <div className="vcard" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick()}>
      <div className="vthumb">
        <Thumb scene={video.scene} />
        <div className="vov" />
        <div className="vplay-btn">{Icons.play}</div>
        <div className="vdur">{video.dur}</div>
        <div className={`vstatus ${video.status === "done" ? "vs-done" : "vs-proc"}`}>
          {video.status === "done" ? "✓ Done" : "⟳ Processing"}
        </div>
        <div className="vs-4k">4K</div>
      </div>
      <div className="vinfo">
        <div className="vname">{video.name}</div>
        <div className="vmeta">
          <span className="vtime">{video.time}</span>
          <span className={`vmod ${video.modelCls}`}>{video.model}</span>
        </div>
      </div>
    </div>
  );
}
