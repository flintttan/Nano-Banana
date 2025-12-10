"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageCreation, editImage } from "@/lib/api";

export interface ImageUploadProps {
  onEditComplete?: (image: ImageCreation) => void;
}

interface LocalPreview {
  file: File;
  url: string;
}

export function ImageUpload({ onEditComplete }: ImageUploadProps) {
  const [previews, setPreviews] = useState<LocalPreview[]>([]);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Clean up object URLs on unmount
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const next: LocalPreview[] = [];
    const maxFiles = 3;

    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      next.push({ file, url });
    }

    // Revoke previous URLs
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));

    setPreviews(next);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!prompt.trim()) {
      setError("Please provide a prompt for the image edit.");
      return;
    }

    if (!previews.length) {
      setError("Please upload at least one image to edit.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await editImage({
        prompt: prompt.trim(),
        model: model.trim() || undefined,
        images: previews.map((preview) => preview.file),
      });

      if (onEditComplete) {
        onEditComplete(result);
      }
    } catch (err: any) {
      if (err?.name === "ApiError" && typeof err.message === "string") {
        setError(err.message);
      } else {
        setError("Image edit failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasImages = previews.length > 0;

  return (
    <Card className="bg-gray-900/60 border-gray-800 p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Image to Image</h2>
        <p className="text-sm text-gray-400 mt-1">
          Upload one or more base images and refine them with a new prompt.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-200">Upload images</label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="bg-gray-950/60 border-gray-700 text-gray-100 cursor-pointer"
        />
        <p className="text-xs text-gray-500">
          Up to 3 images per request. Larger images may take longer to process.
        </p>
      </div>

      {hasImages && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview) => (
            <div
              key={preview.url}
              className="relative overflow-hidden rounded-md border border-gray-800 bg-gray-950"
            >
              <img
                src={preview.url}
                alt={preview.file.name}
                className="h-24 w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10px] text-gray-200 truncate">
                {preview.file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-200">
          Edit prompt
        </label>
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe how you want to modify the uploaded images."
          className="bg-gray-950/60 border-gray-700 text-gray-100 min-h-[100px] placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-200">
          Model (optional)
        </label>
        <Input
          value={model}
          onChange={(event) => setModel(event.target.value)}
          placeholder="Use server default if left empty"
          className="bg-gray-950/60 border-gray-700 text-gray-100"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Editing..." : "Apply Edit"}
        </Button>
      </div>
    </Card>
  );
}

export default ImageUpload;

