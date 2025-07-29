import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  projectId: string;
}

const priorities = [
  { value: "low", label: "Baixa", color: "#10b981" },
  { value: "medium", label: "Média", color: "#f59e0b" },
  { value: "high", label: "Alta", color: "#ef4444" },
];

export default function CreateCardModal({ isOpen, onClose, columnId, projectId }: CreateCardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCardMutation = useMutation({
    mutationFn: async (cardData: any) => {
      return await apiRequest(`/api/columns/${columnId}/cards`, {
        method: "POST",
        body: JSON.stringify(cardData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({
        title: "Cartão criado!",
        description: "Novo cartão adicionado à coluna.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o cartão. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    createCardMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      priority,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="create-card-description">
        <DialogTitle>Criar Novo Cartão</DialogTitle>
        <DialogDescription id="create-card-description">
          Adicione um novo cartão à coluna selecionada.
        </DialogDescription>
        
        <form onSubmit={handleSubmit}>
          <DialogHeader className="sr-only">
            <DialogTitle>Criar Novo Cartão</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="card-title">Título do Cartão *</Label>
              <Input
                id="card-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Implementar autenticação"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="card-description">Descrição</Label>
              <Textarea
                id="card-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes da tarefa..."
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="card-priority">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priorityOption) => (
                    <SelectItem key={priorityOption.value} value={priorityOption.value}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: priorityOption.color }}
                        />
                        <span>{priorityOption.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || createCardMutation.isPending}
            >
              {createCardMutation.isPending ? "Criando..." : "Criar Cartão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}