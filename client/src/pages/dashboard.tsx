import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import ProjectHeader from "@/components/header/project-header";
import ProjectSidebar from "@/components/sidebar/project-sidebar";
import KanbanBoard from "@/components/kanban/kanban-board";
import CreateProjectModal from "@/components/modals/create-project-modal";
import CreateColumnModal from "@/components/modals/create-column-modal";
import CreateCardModal from "@/components/modals/create-card-modal";
import { DndProvider } from "@/components/ui/dnd-context";
import type { ProjectWithRelations } from "@shared/schema";

export default function Dashboard() {
  const { id: projectId } = useParams();
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [viewType, setViewType] = useState<"kanban" | "list" | "calendar" | "timeline">("kanban");
  
  // Modal states
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState("");

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
  const effectiveProjectId = selectedProjectId || (Array.isArray(projects) && projects.length > 0 ? projects[0].id : undefined);

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

  if (!Array.isArray(projects) || projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nenhum projeto encontrado</h2>
          <p className="text-gray-600 mb-6">Crie seu primeiro projeto para começar</p>
          <button 
            onClick={() => setShowCreateProject(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
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
          projects={Array.isArray(projects) ? projects : []}
          currentProject={currentProject}
          onProjectSelect={setSelectedProjectId}
          viewType={viewType}
          onViewTypeChange={setViewType}
          onCreateProject={() => setShowCreateProject(true)}
          onCreateColumn={() => setShowCreateColumn(true)}
          onCreateCard={() => {
            // For card creation, we need to select a column first
            const firstColumn = currentProject?.columns?.[0];
            if (firstColumn) {
              setSelectedColumnId(firstColumn.id);
              setShowCreateCard(true);
            }
          }}
        />
        
        <div className="flex h-screen pt-16">
          <ProjectSidebar project={currentProject} />
          
          <main className="flex-1 overflow-hidden">
            {viewType === "kanban" && currentProject && (
              <KanbanBoard 
                project={currentProject} 
                onCreateCard={(columnId) => {
                  setSelectedColumnId(columnId);
                  setShowCreateCard(true);
                }}
              />
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
        
        {/* Modals */}
        <CreateProjectModal
          isOpen={showCreateProject}
          onClose={() => setShowCreateProject(false)}
        />
        
        {effectiveProjectId && (
          <CreateColumnModal
            isOpen={showCreateColumn}
            onClose={() => setShowCreateColumn(false)}
            projectId={effectiveProjectId}
          />
        )}
        
        {selectedColumnId && effectiveProjectId && (
          <CreateCardModal
            isOpen={showCreateCard}
            onClose={() => {
              setShowCreateCard(false);
              setSelectedColumnId("");
            }}
            columnId={selectedColumnId}
            projectId={effectiveProjectId}
          />
        )}
      </div>
    </DndProvider>
  );
}
