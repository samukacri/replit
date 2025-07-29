import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import ProjectHeader from "@/components/header/project-header";
import ProjectSidebar from "@/components/sidebar/project-sidebar";
import KanbanBoard from "@/components/kanban/kanban-board";
import { DndProvider } from "@/components/ui/dnd-context";
import type { ProjectWithRelations } from "@shared/schema";

export default function Dashboard() {
  const { id: projectId } = useParams();
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [viewType, setViewType] = useState<"kanban" | "list" | "calendar" | "timeline">("kanban");

  // Fetch projects list
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch current project details
  const { data: currentProject, isLoading: projectLoading } = useQuery<ProjectWithRelations>({
    queryKey: ["/api/projects", selectedProjectId],
    enabled: !!selectedProjectId,
  });

  // Use first project if none selected
  const effectiveProjectId = selectedProjectId || (projects?.[0]?.id);

  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nenhum projeto encontrado</h2>
          <p className="text-gray-600 mb-6">Crie seu primeiro projeto para começar</p>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Criar Projeto
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider>
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={setSelectedProjectId}
          viewType={viewType}
          onViewTypeChange={setViewType}
        />
        
        <div className="flex h-screen pt-16">
          <ProjectSidebar project={currentProject} />
          
          <main className="flex-1 overflow-hidden">
            {viewType === "kanban" && currentProject && (
              <KanbanBoard project={currentProject} />
            )}
            
            {viewType === "list" && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Visualização em lista em desenvolvimento</p>
              </div>
            )}
            
            {viewType === "calendar" && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Visualização em calendário em desenvolvimento</p>
              </div>
            )}
            
            {viewType === "timeline" && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Visualização em timeline em desenvolvimento</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </DndProvider>
  );
}
