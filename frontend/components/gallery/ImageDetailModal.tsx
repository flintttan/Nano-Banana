"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Heart, Trash2, Download } from "lucide-react";
import { ImageCreation } from "@/lib/api";

export interface ImageDetailModalProps {
  image: ImageCreation;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ImageDetailModal({
  image,
  isFavorite,
  onClose,
  onToggleFavorite,
  onDelete,
}: ImageDetailModalProps) {
  const rawUrl = image.url || image.image_url || "";
  const src = rawUrl || "/img/placeholder.png";
  const createdAt = image.created_at || image.createdAt;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `image-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Failed to download image", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl w-full max-h-[90vh] overflow-hidden rounded-lg bg-gray-900 border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-white">Image Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(image.id)}
              className={`rounded-md p-2 transition-colors ${
                isFavorite
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                  : "bg-gray-800 text-gray-200 hover:bg-gray-700"
              }`}
            >
              <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleDownload}
              className="rounded-md bg-gray-800 p-2 text-gray-200 hover:bg-gray-700 transition-colors"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                if (confirm("Delete this image?")) {
                  onDelete(image.id);
                }
              }}
              className="rounded-md bg-red-500/20 p-2 text-red-500 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-gray-800 p-2 text-gray-200 hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="relative">
            <Image
              src={src}
              alt={image.prompt || "Generated image"}
              width={1024}
              height={1024}
              className="w-full h-auto rounded-lg border border-gray-800"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Prompt</label>
              <p className="mt-1 text-white">{image.prompt || "No prompt provided"}</p>
            </div>

            {image.model && (
              <div>
                <label className="text-sm font-medium text-gray-400">Model</label>
                <p className="mt-1 text-white">{image.model}</p>
              </div>
            )}

            {image.size && (
              <div>
                <label className="text-sm font-medium text-gray-400">Size</label>
                <p className="mt-1 text-white">{image.size}</p>
              </div>
            )}

            {createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-400">Created</label>
                <p className="mt-1 text-white">
                  {new Date(createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-400">Image ID</label>
              <p className="mt-1 text-white font-mono text-sm">{image.id}</p>
            </div>

            {isFavorite && (
              <div className="mt-4 rounded-md bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <Heart className="h-4 w-4" fill="currentColor" />
                  This image is in your favorites
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
