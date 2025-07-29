import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useDrag({ type, item }: { type: string; item: any }) {
  const dragRef = useRef<HTMLDivElement>(null);
  
  // Simple drag implementation - in a real app you'd use react-dnd or similar
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type, ...item }));
  };

  return {
    isDragging: false, // Simplified
    dragRef,
    handleDragStart,
  };
}

export function useDrop({ accept, onDrop }: { accept: string; onDrop: (item: any) => void }) {
  const dropRef = useRef<HTMLDivElement>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (data) {
      const item = JSON.parse(data);
      if (item.type === accept) {
        onDrop(item);
      }
    }
  };

  return {
    isDragOver: false, // Simplified
    dropRef,
    handleDragOver,
    handleDrop,
  };
}

export function useDragDrop(projectId: string) {
  const queryClient = useQueryClient();

  const moveCardMutation = useMutation({
    mutationFn: async ({ cardId, columnId, position }: { cardId: string; columnId: string; position: number }) => {
      await apiRequest("POST", `/api/cards/${cardId}/move`, { columnId, position });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
    },
  });

  const reorderColumnsMutation = useMutation({
    mutationFn: async (columnOrders: { id: string; position: number }[]) => {
      await apiRequest("POST", `/api/projects/${projectId}/columns/reorder`, { columnOrders });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
    },
  });

  const handleCardDrop = (cardId: string, columnId: string, position: number) => {
    moveCardMutation.mutate({ cardId, columnId, position });
  };

  const handleColumnDrop = (columnId: string, position: number) => {
    // Implementation for column reordering
    console.log("Column drop:", columnId, position);
  };

  return {
    handleCardDrop,
    handleColumnDrop,
    isMovingCard: moveCardMutation.isPending,
  };
}
