"use client";

import Image from "next/image";

import { Card } from "@/components/ui/card";
import { ImageCreation } from "@/lib/api";

export interface ImageGalleryPreviewProps {
  images: ImageCreation[];
  maxItems?: number;
  selectable?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
  onDelete?: (id: number) => void;
  onImageClick?: (image: ImageCreation) => void;
}

export function ImageGalleryPreview({
  images,
  maxItems = 8,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onDelete,
  onImageClick,
}: ImageGalleryPreviewProps) {
  const visible = images.slice(0, maxItems);

  if (!visible.length) {
    return (
      <Card className="bg-gray-900/60 border-gray-800 p-6">
        <p className="text-sm text-gray-500">No images generated yet.</p>
      </Card>
    );
  }

  const isSelected = (id: number) => selectedIds.includes(id);

  return (
    <Card className="bg-gray-900/60 border-gray-800 p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Recent images</h2>
          <p className="text-sm text-gray-400 mt-1">
            A quick preview of your most recent creations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map((image) => {
          const id = image.id;
          const rawUrl = image.url || image.image_url || "";
          const src = rawUrl || "/img/placeholder.png";
          const createdAt = image.createdAt || image.created_at;

          return (
            <div
              key={id}
              className="group relative overflow-hidden rounded-lg border border-gray-800 bg-gray-950/60"
            >
              {selectable && (
                <label className="absolute left-2 top-2 z-10 flex items-center gap-1 text-[11px] text-gray-100">
                  <input
                    type="checkbox"
                    className="h-3 w-3 cursor-pointer accent-emerald-500"
                    checked={isSelected(id)}
                    onChange={() => onToggleSelect && onToggleSelect(id)}
                  />
                  <span>Select</span>
                </label>
              )}

              {onDelete && (
                <button
                  type="button"
                  className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-2 py-[1px] text-[10px] text-red-200 hover:bg-red-600/80 hover:text-white"
                  onClick={() => onDelete(id)}
                >
                  Delete
                </button>
              )}

              <button
                type="button"
                className="block w-full cursor-pointer"
                onClick={() => onImageClick && onImageClick(image)}
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={src}
                    alt={image.prompt || "Generated image"}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              </button>

              <div className="space-y-1 border-t border-gray-800 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
                <p className="line-clamp-2 text-[11px] text-gray-200">
                  {image.prompt}
                </p>
                <p className="text-[10px] text-gray-500 flex justify-between">
                  <span>{image.size || ""}</span>
                  {createdAt && (
                    <span>
                      {new Date(createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default ImageGalleryPreview;

