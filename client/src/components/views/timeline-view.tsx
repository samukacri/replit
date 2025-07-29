
import { useState } from "react";
import { Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ProjectWithRelations, CardWithRelations } from "@shared/schema";

interface TimelineViewProps {
  project: ProjectWithRelations;
  onCardClick: (card: CardWithRelations) => void;
}

export default function TimelineView({ project, onCardClick }: TimelineViewProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "quarter">("month");

  // Get all cards and sort by created date
  const allCards = project.columns.flatMap(column => 
    column.cards.map(card => ({ ...card, columnName: column.name, columnColor: column.color }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Group cards by date
  const groupCardsByDate = () => {
    const groups: { [key: string]: typeof allCards } = {};
    
    allCards.forEach(card => {
      const date = new Date(card.createdAt);
      let key: string;
      
      switch (timeframe) {
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case "quarter":
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(card);
    });
    
    return groups;
  };

  const cardGroups = groupCardsByDate();

  const formatGroupTitle = (key: string) => {
    switch (timeframe) {
      case "week":
        const weekDate = new Date(key);
        const weekEnd = new Date(weekDate);
        weekEnd.setDate(weekDate.getDate() + 6);
        return `${weekDate.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      case "month":
        const [year, month] = key.split('-');
        const monthNames = [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      case "quarter":
        const [qYear, quarter] = key.split('-');
        return `${quarter} ${qYear}`;
      default:
        return key;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-red-500 bg-red-50";
      case "medium": return "border-yellow-500 bg-yellow-50";
      case "low": return "border-green-500 bg-green-50";
      default: return "border-gray-300 bg-white";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Timeline do Projeto</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={timeframe === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("week")}
            >
              Semana
            </Button>
            <Button
              variant={timeframe === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("month")}
            >
              Mês
            </Button>
            <Button
              variant={timeframe === "quarter" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("quarter")}
            >
              Trimestre
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {Object.entries(cardGroups).map(([groupKey, cards], groupIndex) => (
            <div key={groupKey} className="mb-8 last:mb-0">
              {/* Period header */}
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {formatGroupTitle(groupKey)}
                </div>
                <div className="ml-3 text-sm text-gray-500">
                  {cards.length} card{cards.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Cards in this period */}
              <div className="ml-6 border-l-2 border-gray-200 pl-6 space-y-4">
                {cards.map((card, cardIndex) => (
                  <div key={card.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-8 top-4 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                    
                    <Card 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(card.priority)}`}
                      onClick={() => onCardClick(card)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{card.title}</h3>
                            {card.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {card.description}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant="outline"
                            style={{ backgroundColor: card.columnColor + "20", borderColor: card.columnColor }}
                            className="ml-2"
                          >
                            {card.columnName}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            {card.deadline && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Prazo: {new Date(card.deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          
                          {card.assignee && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={card.assignee.profileImageUrl || ""} />
                                <AvatarFallback className="text-xs">
                                  {card.assignee.firstName?.[0]}{card.assignee.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </div>
                        
                        {card.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {card.tags.slice(0, 3).map((cardTag) => (
                              <Badge
                                key={cardTag.tag.id}
                                variant="outline"
                                className="text-xs"
                                style={{ backgroundColor: cardTag.tag.color + "20", borderColor: cardTag.tag.color }}
                              >
                                {cardTag.tag.name}
                              </Badge>
                            ))}
                            {card.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{card.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(cardGroups).length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum card encontrado</h3>
              <p className="text-gray-500">Crie alguns cards para ver a timeline do projeto.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
