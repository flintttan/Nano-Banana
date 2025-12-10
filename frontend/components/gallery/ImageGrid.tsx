"use client";

import ImageCard from "./ImageCard";
import { ImageCreation } from "@/lib/api";

export interface ImageGridProps {
  images: ImageCreation[];
  selectedIds: number[];
  favorites: number[];
  onToggleSelect: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onImageClick: (image: ImageCreation) => void;
}

export default function ImageGrid({
  images,
  selectedIds,
  favorites,
  onToggleSelect,
  onToggleFavorite,
  onImageClick,
}: ImageGridProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          isSelected={selectedIds.includes(image.id)}
          isFavorite={favorites.includes(image.id)}
          onToggleSelect={() => onToggleSelect(image.id)}
          onToggleFavorite={() => onToggleFavorite(image.id)}
          onClick={() => onImageClick(image)}
        />
      ))}
    </div>
  );
}
