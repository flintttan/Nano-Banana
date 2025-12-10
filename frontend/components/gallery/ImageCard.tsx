"use client";

import Image from "next/image";
import { Heart, Download, Trash2 } from "lucide-react";
import { ImageCreation } from "@/lib/api";

export interface ImageCardProps {
  image: ImageCreation;
  isSelected: boolean;
  isFavorite: boolean;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
  onClick: () => void;
}

export default function ImageCard({
  image,
  isSelected,
  isFavorite,
  onToggleSelect,
  onToggleFavorite,
  onClick,
}: ImageCardProps) {
  const rawUrl = image.url || image.image_url || "";
  const src = rawUrl || "/img/placeholder.png";
  const createdAt = image.created_at || image.createdAt;

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border transition-all duration-200 cursor-pointer ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/50"
          : "border-gray-800 hover:border-gray-600"
      }`}
      onClick={onClick}
    >
      <div className="relative aspect-square bg-gray-900">
        <Image
          src={src}
          alt={image.prompt || "Generated image"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      <div className="absolute left-2 top-2 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={`rounded-full bg-black/60 px-2 py-1 text-xs font-medium transition-colors ${
            isSelected
              ? "bg-emerald-500 text-white"
              : "text-gray-200 hover:bg-emerald-500/80"
          }`}
        >
          {isSelected ? "Selected" : "Select"}
        </button>
      </div>

      <div className="absolute right-2 top-2 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`rounded-full bg-black/60 p-2 transition-colors ${
            isFavorite
              ? "text-red-500 hover:bg-red-500/20"
              : "text-gray-200 hover:bg-red-500/80 hover:text-white"
          }`}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="border-t border-gray-800 bg-gradient-to-t from-black/90 to-transparent p-3">
        <p className="line-clamp-2 text-sm text-gray-200 mb-2">
          {image.prompt || "No prompt"}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{image.size || ""}</span>
          {createdAt && (
            <span>
              {new Date(createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
        {image.model && (
          <div className="mt-1 text-xs text-gray-500">
            Model: {image.model}
          </div>
        )}
      </div>
    </div>
  );
}
