"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BatchQueue,
  BatchQueueDetail,
  cancelBatchQueue,
  fetchBatchQueueStatus,
  fetchBatchQueues,
} from "@/lib/api";

export interface GenerationQueueProps {
  activeQueueId?: number | string;
}

export function GenerationQueue({ activeQueueId }: GenerationQueueProps) {
  const [queues, setQueues] = useState<BatchQueue[]>([]);
  const [activeDetail, setActiveDetail] = useState<BatchQueueDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancellingId, setIsCancellingId] = useState<number | null>(null);

  // Load recent queues periodically for overview
  useEffect(() => {
    let cancelled = false;

    const loadQueues = async () => {
      try {
        const data = await fetchBatchQueues(10);
        if (!cancelled) {
          setQueues(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err?.name === "ApiError" && typeof err.message === "string") {
            setError(err.message);
          } else {
            setError("Failed to load batch queues.");
          }
        }
      }
    };

    setIsLoading(true);
    loadQueues().finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    const intervalId = window.setInterval(loadQueues, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  // Poll active queue for near real-time updates
  useEffect(() => {
    let cancelled = false;

    if (!activeQueueId) {
      setActiveDetail(null);
      return () => {
        cancelled = true;
      };
    }

    const loadDetail = async () => {
      try {
        const detail = await fetchBatchQueueStatus(activeQueueId);
        if (!cancelled) {
          setActiveDetail(detail);
          // Keep overview list in sync
          setQueues((prev) => {
            const without = prev.filter((q) => q.id !== detail.queue.id);
            return [detail.queue, ...without].slice(0, 10);
          });
        }
      } catch (err) {
        // Swallow errors here to avoid spamming the UI when queue disappears
        if (!cancelled) {
          setActiveDetail(null);
        }
      }
    };

    loadDetail();

    const intervalId = window.setInterval(loadDetail, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeQueueId]);

  const handleCancel = async (queueId: number) => {
    setError(null);
    setIsCancellingId(queueId);

    try {
      await cancelBatchQueue(queueId);
      // Refresh queues after cancellation
      const updated = await fetchBatchQueues(10);
      setQueues(updated);
      if (activeDetail && activeDetail.queue.id === queueId) {
        setActiveDetail({
          ...activeDetail,
          queue: { ...activeDetail.queue, status: "cancelled" },
        });
      }
    } catch (err: any) {
      if (err?.name === "ApiError" && typeof err.message === "string") {
        setError(err.message);
      } else {
        setError("Failed to cancel queue. Please try again.");
      }
    } finally {
      setIsCancellingId(null);
    }
  };

  const activeQueue = useMemo(() => {
    if (activeDetail) return activeDetail.queue;
    if (!activeQueueId) return null;
    return queues.find((queue) => queue.id === Number(activeQueueId)) || null;
  }, [activeDetail, activeQueueId, queues]);

  const completion = useMemo(() => {
    if (!activeQueue) return 0;
    const total = activeQueue.total_images || 0;
    const done = (activeQueue.completed_images || 0) +
      (activeQueue.failed_images || 0);
    if (!total) return 0;
    return Math.min(100, Math.round((done / total) * 100));
  }, [activeQueue]);

  return (
    <Card className="bg-gray-900/60 border-gray-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Generation Queue</h2>
          <p className="text-sm text-gray-400 mt-1">
            Monitor long-running batch edit tasks and their progress.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
          onClick={async () => {
            setIsLoading(true);
            setError(null);
            try {
              const data = await fetchBatchQueues(10);
              setQueues(data);
            } catch (err: any) {
              if (
                err?.name === "ApiError" && typeof err.message === "string"
              ) {
                setError(err.message);
              } else {
                setError("Failed to refresh queues.");
              }
            } finally {
              setIsLoading(false);
            }
          }}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {activeQueue ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">
                Active queue
              </p>
              <p className="text-xs text-gray-400">
                {activeQueue.batch_name || `Queue #${activeQueue.id}`}
              </p>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              {activeQueue.status}
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-emerald-400"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>
              {activeQueue.completed_images || 0} completed
            </span>
            <span>
              {activeQueue.failed_images || 0} failed
            </span>
            <span>{activeQueue.total_images || 0} total</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No active batch queue. Start a batch edit to see live status here.
        </p>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-300 uppercase tracking-wide">
          Recent queues
        </p>
        {isLoading && !queues.length ? (
          <p className="text-sm text-gray-500">Loading queues...</p>
        ) : queues.length === 0 ? (
          <p className="text-sm text-gray-500">No recent batch queues.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {queues.map((queue) => {
              const total = queue.total_images || 0;
              const done = (queue.completed_images || 0) +
                (queue.failed_images || 0);
              const pct = total
                ? Math.min(100, Math.round((done / total) * 100))
                : 0;
              const isActive =
                activeQueue && queue.id === activeQueue.id &&
                ["pending", "processing"].includes(queue.status);

              return (
                <div
                  key={queue.id}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${
                    isActive
                      ? "border-blue-500/60 bg-blue-500/10"
                      : "border-gray-800 bg-gray-950/60"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-gray-200">
                      {queue.batch_name || `Queue #${queue.id}`}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      {done} / {total} images • {pct}% • {queue.status}
                    </p>
                  </div>
                  {['pending', 'processing'].includes(queue.status) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="ml-3 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
                      disabled={isCancellingId === queue.id}
                      onClick={() => handleCancel(queue.id)}
                    >
                      {isCancellingId === queue.id ? "Cancelling" : "Cancel"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

export default GenerationQueue;
