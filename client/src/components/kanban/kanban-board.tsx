import { useState } from "react";
import { Plus, Filter, SortAsc, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import KanbanColumn from "./kanban-column";
import CardModal from "./card-modal";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { useWebSocket } from "@/hooks/use-websocket";
import type { ProjectWithRelations, CardWithRelations } from "@shared/schema";

interface KanbanBoardProps {
  project: ProjectWithRelations;
}

export default function KanbanBoard({ project }: KanbanBoardProps) {
  const [selectedCard, setSelectedCard] = useState<CardWithRelations | null>(null);
  const { handleCardDrop, handleColumnDrop } = useDragDrop(project.id);
  const { isConnected } = useWebSocket(project.id);

  const totalCards = project.columns.reduce((sum, col) => sum + col.cards.length, 0);

  return (
    <>
      {/* Kanban Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 text-primary" />
          </Button>
          <span className="text-sm text-gray-500">
            {project.columns.length} colunas • {totalCards} cards
          </span>
          {isConnected && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Online
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filtrar
          </Button>
          <Button variant="ghost" size="sm">
            <SortAsc className="h-4 w-4 mr-1" />
            Ordenar
          </Button>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="h-full overflow-x-auto p-6">
        <div className="flex space-x-6 h-full min-w-max">
          {project.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onCardClick={setSelectedCard}
              onCardDrop={handleCardDrop}
              onColumnDrop={handleColumnDrop}
            />
          ))}
        </div>
      </div>

      {/* Card Modal */}
      <CardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        projectId={project.id}
      />
    </>
  );
}
