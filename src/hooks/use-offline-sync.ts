import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QueuedOperation {
  id: string;
  table: string;
  type: "insert" | "update" | "delete";
  data: Record<string, any>;
  timestamp: number;
}

const QUEUE_KEY = "ayiti-biznis-offline-queue";

function getQueue(): QueuedOperation[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedOperation[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function addToQueue(op: Omit<QueuedOperation, "id" | "timestamp">) {
  const queue = getQueue();
  queue.push({
    ...op,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

export function useOfflineSync(onSyncComplete?: () => void) {
  const syncingRef = useRef(false);

  const syncQueue = useCallback(async () => {
    if (syncingRef.current) return;
    const queue = getQueue();
    if (queue.length === 0) return;

    syncingRef.current = true;
    const failed: QueuedOperation[] = [];
    let synced = 0;

    for (const op of queue) {
      try {
        if (op.type === "insert") {
          const { error } = await supabase.from(op.table as any).insert(op.data as any);
          if (error) throw error;
        } else if (op.type === "update") {
          const { id, ...rest } = op.data;
          const { error } = await supabase.from(op.table as any).update(rest as any).eq("id", id);
          if (error) throw error;
        } else if (op.type === "delete") {
          const { error } = await supabase.from(op.table as any).delete().eq("id", op.data.id);
          if (error) throw error;
        }
        synced++;
      } catch (e) {
        console.error("Sync failed for operation:", op, e);
        failed.push(op);
      }
    }

    saveQueue(failed);
    syncingRef.current = false;

    if (synced > 0) {
      toast.success(`${synced} opération(s) synchronisée(s)`);
      onSyncComplete?.();
    }
    if (failed.length > 0) {
      toast.error(`${failed.length} opération(s) en attente`);
    }
  }, [onSyncComplete]);

  // Sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      syncQueue();
    };
    window.addEventListener("online", handleOnline);

    // Also try to sync on mount if online
    if (navigator.onLine) {
      syncQueue();
    }

    return () => window.removeEventListener("online", handleOnline);
  }, [syncQueue]);

  // Periodic sync attempt
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) syncQueue();
    }, 30000); // every 30s
    return () => clearInterval(interval);
  }, [syncQueue]);

  return {
    queueOperation: addToQueue,
    syncQueue,
    pendingCount: getQueue().length,
  };
}

// Helper: perform operation online or queue for later
export async function offlineAwareOperation(
  table: string,
  type: "insert" | "update" | "delete",
  data: Record<string, any>
): Promise<boolean> {
  if (navigator.onLine) {
    return false; // Let normal flow handle it
  }

  // Queue for later sync
  addToQueue({ table, type, data });
  return true; // Handled offline
}
