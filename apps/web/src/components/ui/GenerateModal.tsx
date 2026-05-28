"use client";

import { useState } from "react";

interface GenerateModalProps {
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

export function GenerateModal({ onClose, onGenerate }: GenerateModalProps) {
  const [prompt, setPrompt] = useState("");
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-close" onClick={onClose}>
          ✕
        </div>
        <div className="modal-title">Quick Generate</div>
        <div className="modal-sub">Describe your scene and we&apos;ll create it instantly</div>
        <textarea
          className="modal-ta"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A cinematic shot of a golden retriever running through lavender fields at golden hour, slow motion, warm tones…"
          autoFocus
        />
        <div className="modal-row">
          <button type="button" className="mbtn mbtn-sec" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="mbtn mbtn-pri"
            onClick={() => {
              onGenerate(prompt);
              onClose();
            }}
          >
            Generate · 42 credits
          </button>
        </div>
      </div>
    </div>
  );
}
