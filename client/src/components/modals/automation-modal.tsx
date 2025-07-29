
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: "card_moved" | "card_created" | "deadline_approaching";
    conditions: any;
  };
  actions: {
    type: "assign_user" | "add_tag" | "move_column" | "send_notification";
    parameters: any;
  }[];
  active: boolean;
}

export default function AutomationModal({ isOpen, onClose, projectId }: AutomationModalProps) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: "",
    description: "",
    trigger: { type: "card_moved" as const, conditions: {} },
    actions: [{ type: "assign_user" as const, parameters: {} }],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock automations for demonstration
  const mockAutomations: Automation[] = [
    {
      id: "1",
      name: "Auto-assign novos cards",
      description: "Atribui automaticamente novos cards ao gerente do projeto",
      trigger: { type: "card_created", conditions: {} },
      actions: [{ type: "assign_user", parameters: { userId: "default-manager" } }],
      active: true,
    },
    {
      id: "2",
      name: "Notificar prazos próximos",
      description: "Envia notificação quando faltam 2 dias para o prazo",
      trigger: { type: "deadline_approaching", conditions: { days: 2 } },
      actions: [{ type: "send_notification", parameters: { message: "Prazo se aproximando!" } }],
      active: true,
    },
  ];

  const triggerTypes = [
    { value: "card_moved", label: "Card movido entre colunas" },
    { value: "card_created", label: "Novo card criado" },
    { value: "deadline_approaching", label: "Prazo se aproximando" },
  ];

  const actionTypes = [
    { value: "assign_user", label: "Atribuir usuário" },
    { value: "add_tag", label: "Adicionar tag" },
    { value: "move_column", label: "Mover para coluna" },
    { value: "send_notification", label: "Enviar notificação" },
  ];

  const handleCreateAutomation = () => {
    if (!newAutomation.name.trim()) return;

    const automation: Automation = {
      id: Date.now().toString(),
      ...newAutomation,
      active: true,
    };

    setAutomations([...automations, automation]);
    setNewAutomation({
      name: "",
      description: "",
      trigger: { type: "card_moved", conditions: {} },
      actions: [{ type: "assign_user", parameters: {} }],
    });
    setShowCreateForm(false);
    
    toast({
      title: "Automação criada!",
      description: "A nova automação foi configurada com sucesso.",
    });
  };

  const toggleAutomation = (id: string) => {
    setAutomations(automations.map(auto => 
      auto.id === id ? { ...auto, active: !auto.active } : auto
    ));
  };

  const deleteAutomation = (id: string) => {
    setAutomations(automations.filter(auto => auto.id !== id));
    toast({
      title: "Automação removida",
      description: "A automação foi excluída com sucesso.",
    });
  };

  const displayAutomations = [...mockAutomations, ...automations];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" aria-describedby="automation-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Automações do Projeto</span>
          </DialogTitle>
          <DialogDescription id="automation-description">
            Configure automações para otimizar seu fluxo de trabalho.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-auto space-y-4">
          {/* Existing automations */}
          {displayAutomations.map((automation) => (
            <Card key={automation.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <span>{automation.name}</span>
                      <Badge variant={automation.active ? "default" : "secondary"}>
                        {automation.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-gray-600 mt-1">
                      {automation.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAutomation(automation.id)}
                    >
                      {automation.active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAutomation(automation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-medium">Gatilho: </span>
                    <span className="text-gray-600">
                      {triggerTypes.find(t => t.value === automation.trigger.type)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Ações: </span>
                    <span className="text-gray-600">
                      {automation.actions.map(action => 
                        actionTypes.find(a => a.value === action.type)?.label
                      ).join(", ")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create new automation */}
          {!showCreateForm ? (
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(true)}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Automação
            </Button>
          ) : (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm">Nova Automação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="auto-name">Nome da Automação</Label>
                  <Input
                    id="auto-name"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
                    placeholder="Ex: Notificar quando card é movido"
                  />
                </div>

                <div>
                  <Label htmlFor="auto-description">Descrição</Label>
                  <Textarea
                    id="auto-description"
                    value={newAutomation.description}
                    onChange={(e) => setNewAutomation({ ...newAutomation, description: e.target.value })}
                    placeholder="Descreva o que esta automação faz..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="auto-trigger">Gatilho</Label>
                  <Select
                    value={newAutomation.trigger.type}
                    onValueChange={(value: any) => 
                      setNewAutomation({ 
                        ...newAutomation, 
                        trigger: { ...newAutomation.trigger, type: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="auto-action">Ação</Label>
                  <Select
                    value={newAutomation.actions[0].type}
                    onValueChange={(value: any) => 
                      setNewAutomation({ 
                        ...newAutomation, 
                        actions: [{ type: value, parameters: {} }]
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleCreateAutomation}>
                    Criar Automação
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {displayAutomations.length === 0 && !showCreateForm && (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma automação configurada
              </h3>
              <p className="text-gray-500 mb-4">
                Crie automações para otimizar seu fluxo de trabalho.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Automação
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
