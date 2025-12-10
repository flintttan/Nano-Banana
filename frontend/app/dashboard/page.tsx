"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ImageGalleryPreview from "@/components/image/ImageGalleryPreview";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ImageCreation, UserInfo, fetchImageHistory, fetchUserInfo } from "@/lib/api";

function DashboardContent() {
  const { user } = useAuth();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [images, setImages] = useState<ImageCreation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [info, history] = await Promise.all([
          fetchUserInfo(),
          fetchImageHistory(),
        ]);

        if (!cancelled) {
          setUserInfo(info);
          setImages(history);
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err?.name === "ApiError" && typeof err.message === "string") {
            setError(err.message);
          } else {
            setError("Failed to load dashboard data.");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const credits = userInfo?.drawing_points ?? user?.points ?? 0;
  const imagesCreated = userInfo?.creation_count ?? user?.creation_count ?? 0;
  const checkins = userInfo?.checkin_count ?? 0;
  const memberSince = userInfo?.created_at || user?.created_at || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Welcome back{user?.username ? `, ${user.username}` : ""}. Here is an
            overview of your credits and recent creations.
          </p>
        </header>

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gray-900/60 border-gray-800 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Credits remaining
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {credits}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Drawing points available for image generation.
            </p>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Images created
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {imagesCreated}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Total images generated with Nano Banana.
            </p>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Check-ins
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {checkins}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Daily check-ins completed.
              {memberSince && (
                <span className="block mt-1">
                  Member since {new Date(memberSince).toLocaleDateString()}
                </span>
              )}
            </p>
          </Card>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-100">
              Recent images
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/workspace"
                className="rounded-md border border-gray-700 bg-gray-900/60 px-3 py-1 text-gray-200 hover:bg-gray-800"
              >
                Open workspace
              </Link>
              <Link
                href="/gallery"
                className="rounded-md border border-gray-700 bg-gray-900/60 px-3 py-1 text-gray-200 hover:bg-gray-800"
              >
                View full gallery
              </Link>
            </div>
          </div>

          {isLoading && !images.length ? (
            <Card className="bg-gray-900/60 border-gray-800 p-6">
              <p className="text-sm text-gray-500">Loading recent images...</p>
            </Card>
          ) : (
            <ImageGalleryPreview images={images} maxItems={8} />
          )}
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
