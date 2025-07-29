import { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import KanbanCard from "./kanban-card";
import { useDrop } from "@/hooks/use-drag-drop";
import type { ColumnWithCards, CardWithRelations } from "@shared/schema";

interface KanbanColumnProps {
  column: ColumnWithCards;
  onCardClick: (card: CardWithRelations) => void;
  onCardDrop: (cardId: string, columnId: string, position: number) => void;
  onColumnDrop: (columnId: string, position: number) => void;
  onCreateCard: (columnId: string) => void;
}

export default function KanbanColumn({
  column,
  onCardClick,
  onCardDrop,
  onColumnDrop,
  onCreateCard,
}: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  
  const { isDragOver, dropRef } = useDrop({
    accept: "CARD",
    onDrop: (item: { id: string; type: string }) => {
      if (item.type === "CARD") {
        onCardDrop(item.id, column.id, column.cards.length);
      }
    },
  });

  const getColumnBgClass = () => {
    const colorMap: Record<string, string> = {
      "#6B7280": "bg-gray-100",
      "#3B82F6": "bg-blue-50",
      "#F59E0B": "bg-yellow-50",
      "#10B981": "bg-green-50",
    };
    return colorMap[column.color || "#6B7280"] || "bg-gray-100";
  };

  const getColumnBorderClass = () => {
    const colorMap: Record<string, string> = {
      "#6B7280": "border-gray-200",
      "#3B82F6": "border-blue-200",
      "#F59E0B": "border-yellow-200",
      "#10B981": "border-green-200",
    };
    return colorMap[column.color || "#6B7280"] || "border-gray-200";
  };

  const getAddButtonClass = () => {
    const colorMap: Record<string, string> = {
      "#6B7280": "border-gray-300 text-gray-500 hover:border-gray-400",
      "#3B82F6": "border-blue-300 text-blue-600 hover:border-blue-400",
      "#F59E0B": "border-yellow-300 text-yellow-700 hover:border-yellow-400",
      "#10B981": "border-green-300 text-green-700 hover:border-green-400",
    };
    return colorMap[column.color || "#6B7280"] || "border-gray-300 text-gray-500 hover:border-gray-400";
  };

  return (
    <div
      ref={dropRef}
      className={`w-80 ${getColumnBgClass()} rounded-lg flex flex-col transition-colors ${
        isDragOver ? "ring-2 ring-primary ring-opacity-50" : ""
      }`}
    >
      {/* Column Header */}
      <div className={`p-4 border-b ${getColumnBorderClass()} bg-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: column.color || "#6b7280" }}
            />
            <h3 className="font-semibold text-gray-900">{column.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {column.cards.length}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Editar coluna</DropdownMenuItem>
              <DropdownMenuItem>Adicionar automação</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Excluir coluna</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {column.cards.map((card, index) => (
          <KanbanCard
            key={card.id}
            card={card}
            onClick={() => onCardClick(card)}
            position={index}
          />
        ))}

        {/* Add Card Button */}
        <Button
          variant="outline"
          className={`w-full p-3 border-2 border-dashed ${getAddButtonClass()} text-sm font-medium h-auto`}
          onClick={() => onCreateCard(column.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar card
        </Button>
      </div>
    </div>
  );
}
