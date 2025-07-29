
import { useState } from "react";
import { CheckSquare, Calendar, User, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectWithRelations, CardWithRelations } from "@shared/schema";

interface ListViewProps {
  project: ProjectWithRelations;
  onCardClick: (card: CardWithRelations) => void;
}

export default function ListView({ project, onCardClick }: ListViewProps) {
  const [sortBy, setSortBy] = useState<"title" | "priority" | "deadline" | "column">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Flatten all cards from all columns
  const allCards = project.columns.flatMap(column => 
    column.cards.map(card => ({ ...card, columnName: column.name, columnColor: column.color }))
  );

  // Sort cards
  const sortedCards = [...allCards].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case "deadline":
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        break;
      case "column":
        comparison = a.columnName.localeCompare(b.columnName);
        break;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
      default: return priority;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Visualização em Lista</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sortBy === "title") {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("title");
                  setSortOrder("asc");
                }
              }}
            >
              Título
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sortBy === "priority") {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("priority");
                  setSortOrder("desc");
                }
              }}
            >
              Prioridade
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sortBy === "deadline") {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("deadline");
                  setSortOrder("asc");
                }
              }}
            >
              Prazo
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Coluna</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCards.map((card) => (
              <TableRow 
                key={card.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onCardClick(card)}
              >
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle completed status
                    }}
                  >
                    <CheckSquare 
                      className={`h-4 w-4 ${card.completed ? 'text-green-600' : 'text-gray-400'}`}
                    />
                  </Button>
                </TableCell>
                <TableCell className="font-medium">
                  <div className={card.completed ? "line-through text-gray-500" : ""}>
                    {card.title}
                  </div>
                  {card.description && (
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {card.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    style={{ backgroundColor: card.columnColor + "20", borderColor: card.columnColor }}
                  >
                    {card.columnName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(card.priority)}>
                    {getPriorityLabel(card.priority)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {card.assignee ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={card.assignee.profileImageUrl || ""} />
                        <AvatarFallback>
                          {card.assignee.firstName?.[0]}{card.assignee.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {card.assignee.firstName} {card.assignee.lastName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Não atribuído</span>
                  )}
                </TableCell>
                <TableCell>
                  {card.deadline ? (
                    <div className="flex items-center space-x-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(card.deadline).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Sem prazo</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {card.tags.slice(0, 2).map((cardTag) => (
                      <Badge
                        key={cardTag.tag.id}
                        variant="outline"
                        className="text-xs"
                        style={{ backgroundColor: cardTag.tag.color + "20", borderColor: cardTag.tag.color }}
                      >
                        {cardTag.tag.name}
                      </Badge>
                    ))}
                    {card.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{card.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Mover</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
