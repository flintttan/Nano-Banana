"use client";

import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FilterBar from "@/components/gallery/FilterBar";
import ImageDetailModal from "@/components/gallery/ImageDetailModal";
import ImageGrid from "@/components/gallery/ImageGrid";
import { Card } from "@/components/ui/card";
import { ImageCreation, fetchImageHistory, deleteImage } from "@/lib/api";

interface FilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  type: string;
  status: string;
}

function GalleryContent() {
  const [images, setImages] = useState<ImageCreation[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageCreation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageCreation | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    dateFrom: "",
    dateTo: "",
    type: "",
    status: "",
  });

  const itemsPerPage = 24;

  useEffect(() => {
    loadImages();
    loadFavorites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [images, filters]);

  const loadImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const history = await fetchImageHistory();
      setImages(history);
    } catch (err: any) {
      setError(err?.message || "Failed to load image history");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = () => {
    const stored = localStorage.getItem("image_favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  };

  const saveFavorites = (newFavorites: number[]) => {
    localStorage.setItem("image_favorites", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const applyFilters = () => {
    let filtered = [...images];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((img) =>
        img.prompt?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((img) => {
        const imgDate = new Date(img.created_at || img.createdAt || "");
        return imgDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((img) => {
        const imgDate = new Date(img.created_at || img.createdAt || "");
        return imgDate <= toDate;
      });
    }

    if (filters.type === "favorites") {
      filtered = filtered.filter((img) => favorites.includes(img.id));
    }

    setFilteredImages(filtered);
    setCurrentPage(1);
  };

  const handleToggleFavorite = (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((fid) => fid !== id)
      : [...favorites, id];
    saveFavorites(newFavorites);
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageImages = filteredImages.slice(startIdx, endIdx);
    const pageIds = pageImages.map((img) => img.id);

    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected image(s)?`)) return;

    const failures: number[] = [];
    for (const id of selectedIds) {
      try {
        await deleteImage(id);
      } catch (err) {
        console.error(`Failed to delete image ${id}`, err);
        failures.push(id);
      }
    }

    if (failures.length === 0) {
      setImages((prev) => prev.filter((img) => !selectedIds.includes(img.id)));
      setSelectedIds([]);
    } else {
      alert(
        `Failed to delete ${failures.length} image(s). Please try again.`
      );
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedIds.length === 0) return;

    const selectedImages = images.filter((img) => selectedIds.includes(img.id));

    for (const img of selectedImages) {
      const url = img.url || img.image_url || "";
      if (!url) continue;

      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `image-${img.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error(`Failed to download image ${img.id}`, err);
      }
    }
  };

  // Pagination: Calculate total pages and current page items
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentImages = filteredImages.slice(startIdx, endIdx);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Image Gallery</h1>
          <p className="text-gray-400 text-sm">
            Browse, search, and manage your generated images.
          </p>
        </header>

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          selectedCount={selectedIds.length}
          onSelectAll={handleSelectAll}
          onDeleteSelected={handleDeleteSelected}
          onDownloadSelected={handleDownloadSelected}
        />

        {isLoading && images.length === 0 ? (
          <Card className="bg-gray-900/60 border-gray-800 p-8">
            <p className="text-center text-gray-500">Loading images...</p>
          </Card>
        ) : currentImages.length === 0 ? (
          <Card className="bg-gray-900/60 border-gray-800 p-8">
            <p className="text-center text-gray-500">
              No images found. Try adjusting your filters.
            </p>
          </Card>
        ) : (
          <>
            <ImageGrid
              images={currentImages}
              selectedIds={selectedIds}
              favorites={favorites}
              onToggleSelect={handleToggleSelect}
              onToggleFavorite={handleToggleFavorite}
              onImageClick={setSelectedImage}
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          isFavorite={favorites.includes(selectedImage.id)}
          onClose={() => setSelectedImage(null)}
          onToggleFavorite={handleToggleFavorite}
          onDelete={async (id) => {
            try {
              await deleteImage(id);
              setImages((prev) => prev.filter((img) => img.id !== id));
              setSelectedImage(null);
            } catch (err: any) {
              alert(err?.message || "Failed to delete image");
            }
          }}
        />
      )}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <ProtectedRoute>
      <GalleryContent />
    </ProtectedRoute>
  );
}
