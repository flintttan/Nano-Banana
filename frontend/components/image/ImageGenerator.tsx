"use client";

import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageCreation, GenerateImageRequest, generateImage } from "@/lib/api";

const MAX_PROMPT_LENGTH = 400;

export interface ImageGeneratorProps {
  onGenerationComplete?: (images: ImageCreation[]) => void;
}

const SUGGESTIONS: string[] = [
  "A cyberpunk city at night with neon lights and flying cars",
  "A cute cartoon banana astronaut exploring a tiny planet",
  "Studio portrait of a cat wearing headphones, 4k, soft lighting",
  "Minimalist flat illustration of a productivity dashboard UI",
];

export function ImageGenerator({ onGenerationComplete }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [model, setModel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charactersUsed = prompt.length;

  const isPromptTooLong = charactersUsed > MAX_PROMPT_LENGTH;

  const canSubmit = useMemo(() => {
    if (!prompt.trim()) return false;
    if (isPromptTooLong) return false;
    if (quantity < 1 || quantity > 4) return false;
    return true;
  }, [prompt, isPromptTooLong, quantity]);

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
  };

  const handleQuantityChange = (value: string) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    if (parsed < 1 || parsed > 4) return;
    setQuantity(parsed);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!canSubmit) {
      setError("Please enter a valid prompt before generating.");
      return;
    }

    const payload: GenerateImageRequest = {
      prompt: prompt.trim(),
      quantity,
    };

    if (model.trim()) {
      payload.model = model.trim();
    }

    setIsSubmitting(true);

    try {
      const result = await generateImage(payload);

      const images = Array.isArray(result) ? result : [result];

      if (onGenerationComplete) {
        onGenerationComplete(images);
      }
    } catch (err: any) {
      if (err?.name === "ApiError" && typeof err.message === "string") {
        setError(err.message);
      } else {
        setError("Image generation failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gray-900/60 border-gray-800 p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Text to Image
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Describe the image you want to generate. You can create up to 4 images
          per request.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-200">
            Prompt
          </label>
          <span
            className={`text-xs ${
              isPromptTooLong ? "text-red-400" : "text-gray-400"
            }`}
          >
            {charactersUsed} / {MAX_PROMPT_LENGTH}
          </span>
        </div>
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="e.g. A hyper-realistic illustration of a futuristic banana-shaped spaceship flying through a neon galaxy"
          className="bg-gray-950/60 border-gray-700 text-gray-100 placeholder:text-gray-500 min-h-[120px]"
        />
        {isPromptTooLong && (
          <p className="text-xs text-red-400">
            Prompt is too long. Please shorten it to {MAX_PROMPT_LENGTH} characters
            or less.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Number of images
          </label>
          <Input
            type="number"
            min={1}
            max={4}
            value={quantity}
            onChange={(event) => handleQuantityChange(event.target.value)}
            className="bg-gray-950/60 border-gray-700 text-gray-100"
          />
          <p className="text-xs text-gray-500">
            Between 1 and 4 images per request.
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-200">
            Model (optional)
          </label>
          <Input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="e.g. gemini-2.5-flash-image (leave empty for default)"
            className="bg-gray-950/60 border-gray-700 text-gray-100"
          />
          <p className="text-xs text-gray-500">
            Leave blank to use the default model configured on the server.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-300 uppercase tracking-wide">
          Prompt suggestions
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((item) => (
            <Button
              key={item}
              type="button"
              variant="outline"
              size="sm"
              className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white"
              onClick={() => handleSuggestionClick(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Generating..." : "Generate Images"}
        </Button>
      </div>
    </Card>
  );
}

export default ImageGenerator;

