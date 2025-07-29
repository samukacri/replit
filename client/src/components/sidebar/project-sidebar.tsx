import { Settings, Plus, Columns, Download, Bot, Building, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { ProjectWithRelations } from "@shared/schema";

interface ProjectSidebarProps {
  project?: ProjectWithRelations;
}

export default function ProjectSidebar({ project }: ProjectSidebarProps) {
  if (!project) {
    return (
      <aside className="w-80 bg-white border-r border-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Carregando projeto...</p>
      </aside>
    );
  }

  const totalCards = project._count?.cards || 0;
  const completedCards = project._count?.completedCards || 0;
  const progressPercentage = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  // Calculate days until deadline
  const daysUntilDeadline = project.deadline 
    ? Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Project Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Projeto Atual</h2>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Progresso</span>
            <span className="font-medium text-gray-900">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {daysUntilDeadline !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Prazo</span>
              <span className="font-medium text-gray-900">
                {daysUntilDeadline > 0 ? `${daysUntilDeadline} dias` : "Vencido"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Filtros Inteligentes</h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto text-sm text-gray-700 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Alta Prioridade</span>
            </div>
            <Badge variant="secondary" className="text-xs">8</Badge>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto text-sm text-gray-700 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Vencendo Hoje</span>
            </div>
            <Badge variant="secondary" className="text-xs">3</Badge>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto text-sm text-gray-700 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Minhas Tarefas</span>
            </div>
            <Badge variant="secondary" className="text-xs">12</Badge>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto text-sm text-gray-700 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Concluídas Hoje</span>
            </div>
            <Badge variant="secondary" className="text-xs">5</Badge>
          </Button>
        </div>
      </div>

      {/* Entity Links */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Entidades Vinculadas</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Imóveis</div>
              <div className="text-xs text-gray-500">
                {project.entities.filter(e => e.type === "property").length} propriedades
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Pessoas</div>
              <div className="text-xs text-gray-500">
                {project.entities.filter(e => e.type === "person").length} contatos
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Contratos</div>
              <div className="text-xs text-gray-500">
                {project.entities.filter(e => e.type === "contract").length} ativos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 flex-1">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Ações Rápidas</h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start p-2 h-auto text-sm text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 text-primary mr-2" />
            <span>Novo Card</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start p-2 h-auto text-sm text-gray-700 hover:bg-gray-50"
          >
            <Columns className="h-4 w-4 text-primary mr-2" />
            <span>Nova Coluna</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start p-2 h-auto text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4 text-primary mr-2" />
            <span>Exportar Dados</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start p-2 h-auto text-sm text-gray-700 hover:bg-gray-50"
          >
            <Bot className="h-4 w-4 text-primary mr-2" />
            <span>Automações</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
