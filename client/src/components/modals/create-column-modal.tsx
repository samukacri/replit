import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const columnColors = [
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#f59e0b", label: "Amarelo" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#6b7280", label: "Cinza" },
];

export default function CreateColumnModal({ isOpen, onClose, projectId }: CreateColumnModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#8b5cf6");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createColumnMutation = useMutation({
    mutationFn: async (columnData: any) => {
      return await apiRequest(`/api/projects/${projectId}/columns`, {
        method: "POST",
        body: JSON.stringify(columnData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({
        title: "Coluna criada!",
        description: "Nova coluna adicionada ao projeto.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a coluna. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setName("");
    setColor("#8b5cf6");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    createColumnMutation.mutate({
      name: name.trim(),
      color,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="create-column-description">
        <DialogTitle>Criar Nova Coluna</DialogTitle>
        <DialogDescription id="create-column-description">
          Adicione uma nova coluna ao seu quadro Kanban.
        </DialogDescription>
        
        <form onSubmit={handleSubmit}>
          <DialogHeader className="sr-only">
            <DialogTitle>Criar Nova Coluna</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-name">Nome da Coluna *</Label>
              <Input
                id="column-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Em Andamento"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="column-color">Cor</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cor" />
                </SelectTrigger>
                <SelectContent>
                  {columnColors.map((colorOption) => (
                    <SelectItem key={colorOption.value} value={colorOption.value}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: colorOption.value }}
                        />
                        <span>{colorOption.label}</span>
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
              disabled={!name.trim() || createColumnMutation.isPending}
            >
              {createColumnMutation.isPending ? "Criando..." : "Criar Coluna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}