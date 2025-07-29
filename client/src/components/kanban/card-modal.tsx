import { useState } from "react";
import { X, Link, Star, Plus, Download, AtSign, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CardWithRelations } from "@shared/schema";
import CardTags from "./card-tags";

interface CardModalProps {
  card: CardWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export default function CardModal({ card, isOpen, onClose, projectId }: CardModalProps) {
  const [newComment, setNewComment] = useState("");

  if (!card) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // TODO: Submit comment via API
      console.log("Submit comment:", newComment);
      setNewComment("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" aria-describedby="card-description">
        <DialogTitle className="sr-only">Detalhes do Cartão</DialogTitle>
        <DialogDescription id="card-description" className="sr-only">
          Visualizar e editar detalhes do cartão {card.title}
        </DialogDescription>
        {/* Modal Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-4 h-4 ${getPriorityColor(card.priority || "medium")} rounded-full`} />
            <Input
              defaultValue={card.title || ""}
              className="text-xl font-semibold text-gray-900 border-none bg-transparent focus:ring-0 p-0 h-auto"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Descrição</h3>
              <Textarea
                defaultValue={card.description || ""}
                placeholder="Adicionar descrição..."
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Checklist */}
            {card.checklistItems.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Checklist ({card._count?.completedChecklistItems}/{card._count?.checklistItems} concluídos)
                </h3>
                <div className="space-y-2">
                  {card.checklistItems.map((item) => (
                    <label key={item.id} className="flex items-center space-x-3 cursor-pointer">
                      <Checkbox 
                        checked={item.completed}
                        className="rounded"
                      />
                      <span className={`text-sm ${item.completed ? "line-through text-gray-500" : "text-gray-700"}`}>
                        {item.title}
                      </span>
                    </label>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-2 text-primary">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar item
                </Button>
              </div>
            )}

            {/* Attachments */}
            {card.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Anexos ({card.attachments.length})
                </h3>
                <div className="space-y-2">
                  {card.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-gray-500">
                          {/* File type icon would go here */}
                          📄
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{attachment.originalName}</div>
                          <div className="text-xs text-gray-500">
                            {Math.round(attachment.size / 1024)} KB • 
                            Adicionado {attachment.createdAt ? formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true, locale: ptBR }) : ""}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-2 w-full text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar anexo
                </Button>
              </div>
            )}

            {/* Comments */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Comentários ({card.comments.length})
              </h3>
              <div className="space-y-4">
                {card.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.profileImageUrl || ""} />
                      <AvatarFallback className="text-xs">
                        {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.firstName} {comment.author.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR }) : ""}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="mt-4 flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Adicionar comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <AtSign className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Comentar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Status */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Status</h3>
              <Select defaultValue="backlog">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="progress">Em Progresso</SelectItem>
                  <SelectItem value="review">Em Revisão</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Prioridade</h3>
              <Select defaultValue={card.priority || "medium"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 Alta</SelectItem>
                  <SelectItem value="medium">🟡 Média</SelectItem>
                  <SelectItem value="low">🟢 Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Responsável</h3>
              <div className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg">
                {card.assignee ? (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={card.assignee.profileImageUrl || ""} />
                      <AvatarFallback className="text-xs">
                        {card.assignee.firstName?.[0]}{card.assignee.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700">
                      {card.assignee.firstName} {card.assignee.lastName}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Não atribuído</span>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Prazo</h3>
              <Input
                type="date"
                defaultValue={card.deadline ? new Date(card.deadline).toISOString().split('T')[0] : ""}
              />
              {card.deadline && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-red-600">
                  <span>⚠️</span>
                  <span>
                    {card.deadline ? formatDistanceToNow(new Date(card.deadline), { addSuffix: true, locale: ptBR }) : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            <CardTags card={card} projectId={projectId} />

            {/* Linked Entities */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Entidades Vinculadas</h3>
              <div className="space-y-2">
                {card.entities.map(({ entity }) => (
                  <div key={entity.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">{entity.name}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-2 w-full text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Vincular entidade
              </Button>
            </div>

            {/* Activity History */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Histórico</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Card criado {formatDistanceToNow(new Date(card.createdAt), { addSuffix: true, locale: ptBR })}</span>
                </div>
                {card.updatedAt !== card.createdAt && (
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    <span>Última atualização {formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true, locale: ptBR })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}