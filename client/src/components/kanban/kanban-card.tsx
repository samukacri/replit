import { Calendar, Paperclip, MessageCircle, CheckSquare, Building, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useDrag } from "@/hooks/use-drag-drop";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CardWithRelations } from "@shared/schema";

interface KanbanCardProps {
  card: CardWithRelations;
  onClick: () => void;
  position: number;
}

export default function KanbanCard({ card, onClick, position }: KanbanCardProps) {
  const { isDragging, dragRef } = useDrag({
    type: "CARD",
    item: { id: card.id, type: "CARD" },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-300";
      case "medium":
        return "border-yellow-300";
      case "low":
        return "border-green-300";
      default:
        return "border-gray-300";
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "property":
        return <Building className="h-3 w-3" />;
      case "person":
        return <User className="h-3 w-3" />;
      case "contract":
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const checklistProgress = card._count?.checklistItems 
    ? Math.round((card._count.completedChecklistItems / card._count.checklistItems) * 100)
    : 0;

  const deadlineText = card.deadline 
    ? formatDistanceToNow(new Date(card.deadline), { addSuffix: true, locale: ptBR })
    : null;

  const isOverdue = card.deadline && new Date(card.deadline) < new Date();

  return (
    <div
      ref={dragRef}
      onClick={onClick}
      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${getPriorityBorderColor(card.priority)} ${
        isDragging ? "opacity-50 rotate-3 scale-105" : ""
      }`}
    >
      {/* Title and Priority */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-5 flex-1 mr-2">
          {card.title}
        </h4>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className={`w-2 h-2 ${getPriorityColor(card.priority)} rounded-full`} />
        </div>
      </div>

      {/* Description */}
      {card.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.tags.slice(0, 2).map(({ tag }) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs px-2 py-1"
              style={{ 
                backgroundColor: `${tag.color}20`, 
                color: tag.color,
                borderColor: `${tag.color}40`
              }}
            >
              {tag.name}
            </Badge>
          ))}
          {card.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              +{card.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Checklist Progress */}
      {card._count && card._count.checklistItems > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progresso</span>
            <span>{checklistProgress}%</span>
          </div>
          <Progress value={checklistProgress} className="h-1.5" />
        </div>
      )}

      {/* Entity Links */}
      {card.entities.length > 0 && (
        <div className="flex items-center space-x-2 mb-3 text-xs text-gray-500">
          {card.entities.slice(0, 2).map(({ entity }) => (
            <div key={entity.id} className="flex items-center space-x-1">
              {getEntityIcon(entity.type)}
              <span className="truncate max-w-20">{entity.name}</span>
            </div>
          ))}
          {card.entities.length > 2 && (
            <span>+{card.entities.length - 2}</span>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {card._count && card._count.attachments > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Paperclip className="h-3 w-3" />
              <span>{card._count.attachments}</span>
            </div>
          )}
          {card._count && card._count.comments > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <MessageCircle className="h-3 w-3" />
              <span>{card._count.comments}</span>
            </div>
          )}
          {card._count && card._count.checklistItems > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <CheckSquare className="h-3 w-3" />
              <span>{card._count.completedChecklistItems}/{card._count.checklistItems}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {card.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={card.assignee.profileImageUrl || ""} />
              <AvatarFallback className="text-xs">
                {card.assignee.firstName?.[0]}{card.assignee.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          )}
          {deadlineText && (
            <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
              {deadlineText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
