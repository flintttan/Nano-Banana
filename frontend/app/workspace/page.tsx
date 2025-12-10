"use client";

import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GenerationQueue from "@/components/image/GenerationQueue";
import ImageGalleryPreview from "@/components/image/ImageGalleryPreview";
import ImageGenerator from "@/components/image/ImageGenerator";
import ImageUpload from "@/components/image/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  BatchEditResult,
  ImageCreation,
  batchEditImages,
  deleteImage,
  fetchImageHistory,
} from "@/lib/api";

export default function WorkspacePage() {
  const [images, setImages] = useState<ImageCreation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchPrompt, setBatchPrompt] = useState("");
  const [batchModel, setBatchModel] = useState("nano-banana");
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [activeQueueId, setActiveQueueId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setHistoryError(null);
      try {
        const data = await fetchImageHistory();
        if (!cancelled) {
          setImages(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err?.name === "ApiError" && typeof err.message === "string") {
            setHistoryError(err.message);
          } else {
            setHistoryError("Failed to load image history.");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const appendImages = (incoming: ImageCreation[]) => {
    if (!incoming.length) return;
    setImages((previous) => {
      const existingIds = new Set(previous.map((image) => image.id));
      const normalized = incoming.filter((image) => !existingIds.has(image.id));
      return [...normalized, ...previous];
    });
  };

  const handleGenerationComplete = (incoming: ImageCreation[]) => {
    appendImages(incoming);
  };

  const handleEditComplete = (image: ImageCreation) => {
    appendImages([image]);
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const handleDeleteImage = async (id: number) => {
    setHistoryError(null);
    try {
      await deleteImage(id);
      setImages((previous) => previous.filter((image) => image.id !== id));
      setSelectedIds((previous) => previous.filter((item) => item !== id));
    } catch (err: any) {
      if (err?.name === "ApiError" && typeof err.message === "string") {
        setHistoryError(err.message);
      } else {
        setHistoryError("Failed to delete image. Please try again.");
      }
    }
  };

  const handleSubmitBatch = async () => {
    setBatchError(null);

    if (!selectedIds.length) {
      setBatchError("Please select at least one image for batch editing.");
      return;
    }

    if (!batchModel.trim()) {
      setBatchError("Please specify a model for batch editing.");
      return;
    }

    const payload = {
      imageIds: selectedIds,
      model: batchModel.trim(),
      prompt: batchPrompt.trim() || undefined,
    };

    setIsSubmittingBatch(true);

    try {
      const result: BatchEditResult = await batchEditImages(payload);
      setActiveQueueId(result.queueId);
    } catch (err: any) {
      if (err?.name === "ApiError" && typeof err.message === "string") {
        setBatchError(err.message);
      } else {
        setBatchError("Failed to create batch edit task.");
      }
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Image Generation Workspace
            </h1>
            <p className="text-gray-400 text-sm">
              Generate new images, upload existing ones for editing, and manage
              long-running batch operations in a single place.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <ImageGenerator onGenerationComplete={handleGenerationComplete} />
            <ImageUpload onEditComplete={handleEditComplete} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              {isLoadingHistory && !images.length && (
                <p className="text-sm text-gray-500">
                  Loading your recent images...
                </p>
              )}
              {historyError && (
                <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {historyError}
                </div>
              )}
              <ImageGalleryPreview
                images={images}
                selectable
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onDelete={handleDeleteImage}
              />
            </div>

            <div className="space-y-4">
              <Card className="bg-gray-900/60 border-gray-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Batch edit
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Apply a prompt and model to multiple selected images at
                      once.
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-800 px-3 py-1 text-[11px] text-gray-200">
                    {selectedIds.length} selected
                  </span>
                </div>

                {batchError && (
                  <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    {batchError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">
                    Batch prompt (optional)
                  </label>
                  <Textarea
                    value={batchPrompt}
                    onChange={(event) => setBatchPrompt(event.target.value)}
                    placeholder="Override the original prompts for the selected images, or leave empty to reuse their existing prompts."
                    className="bg-gray-950/60 border-gray-700 text-gray-100 min-h-[80px] placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">
                    Model
                  </label>
                  <input
                    value={batchModel}
                    onChange={(event) => setBatchModel(event.target.value)}
                    placeholder="e.g. gemini-2.5-flash-image"
                    className="w-full rounded-md border border-gray-700 bg-gray-950/60 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleSubmitBatch}
                  disabled={isSubmittingBatch}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  {isSubmittingBatch
                    ? "Creating batch task..."
                    : "Start batch edit"}
                </Button>
              </Card>

              <GenerationQueue activeQueueId={activeQueueId ?? undefined} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
