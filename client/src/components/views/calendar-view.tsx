
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectWithRelations, CardWithRelations } from "@shared/schema";

interface CalendarViewProps {
  project: ProjectWithRelations;
  onCardClick: (card: CardWithRelations) => void;
}

export default function CalendarView({ project, onCardClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get cards with deadlines
  const cardsWithDeadlines = project.columns.flatMap(column => 
    column.cards.filter(card => card.deadline)
  );

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const getCardsForDate = (date: Date) => {
    return cardsWithDeadlines.filter(card => {
      if (!card.deadline) return false;
      const cardDate = new Date(card.deadline);
      return cardDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Visualização em Calendário</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Hoje
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Day headers */}
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            const cardsForDate = getCardsForDate(date);
            
            return (
              <div
                key={index}
                className={`bg-white p-2 min-h-[100px] ${
                  isCurrentMonth(date) ? "" : "text-gray-400"
                } ${isToday(date) ? "bg-blue-50" : ""}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday(date) ? "text-blue-600" : ""
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {cardsForDate.slice(0, 3).map((card) => (
                    <Card
                      key={card.id}
                      className="cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => onCardClick(card)}
                    >
                      <CardContent className="p-2">
                        <div className="text-xs font-medium truncate">
                          {card.title}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              backgroundColor: card.priority === "high" ? "#fef2f2" : 
                                             card.priority === "medium" ? "#fffbeb" : "#f0fdf4",
                              borderColor: card.priority === "high" ? "#ef4444" : 
                                         card.priority === "medium" ? "#f59e0b" : "#10b981"
                            }}
                          >
                            {card.priority === "high" ? "Alta" : 
                             card.priority === "medium" ? "Média" : "Baixa"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {cardsForDate.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{cardsForDate.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
