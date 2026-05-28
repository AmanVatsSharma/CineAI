"use client";

import { useEffect } from "react";

interface ToastProps {
  msg: string;
  color?: string;
  onClose: () => void;
}

export function Toast({ msg, color, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="toast">
      <div className="toast-dot" style={{ background: color || "var(--acc)" }} />
      <span>{msg}</span>
    </div>
  );
}
