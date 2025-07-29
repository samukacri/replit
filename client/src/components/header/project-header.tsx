import { Search, Bell, ChevronDown, Columns, List, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Project, ProjectWithRelations } from "@shared/schema";

interface ProjectHeaderProps {
  projects: Project[];
  currentProject?: ProjectWithRelations;
  onProjectSelect: (projectId: string) => void;
  viewType: "kanban" | "list" | "calendar" | "timeline";
  onViewTypeChange: (view: "kanban" | "list" | "calendar" | "timeline") => void;
}

export default function ProjectHeader({
  projects,
  currentProject,
  onProjectSelect,
  viewType,
  onViewTypeChange,
}: ProjectHeaderProps) {
  const getViewIcon = (view: string) => {
    switch (view) {
      case "kanban":
        return <Columns className="h-4 w-4" />;
      case "list":
        return <List className="h-4 w-4" />;
      case "calendar":
        return <Calendar className="h-4 w-4" />;
      case "timeline":
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Columns className="h-4 w-4" />;
    }
  };

  const getViewLabel = (view: string) => {
    switch (view) {
      case "kanban":
        return "Kanban";
      case "list":
        return "Lista";
      case "calendar":
        return "Calendário";
      case "timeline":
        return "Timeline";
      default:
        return "Kanban";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Columns className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">ProjectFlow</h1>
        </div>
        
        <div className="text-sm text-gray-500">|</div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {currentProject?.name || "Selecionar Projeto"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => onProjectSelect(project.id)}
                className="flex items-center space-x-2"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span>{project.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(["kanban", "list", "calendar", "timeline"] as const).map((view) => (
            <Button
              key={view}
              variant={viewType === view ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewTypeChange(view)}
              className={`px-3 py-1 text-sm font-medium ${
                viewType === view
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {getViewIcon(view)}
              <span className="ml-1">{getViewLabel(view)}</span>
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar cards..."
            className="pl-10 pr-4 py-2 w-64"
          />
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-4 w-4 text-gray-400" />
            <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
              <span className="sr-only">Notificações</span>
            </Badge>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
