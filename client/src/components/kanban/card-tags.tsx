
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Tag, CardWithRelations } from "@shared/schema";

interface CardTagsProps {
  card: CardWithRelations;
  projectId: string;
}

export default function CardTags({ card, projectId }: CardTagsProps) {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch project tags
  const { data: allTags = [] } = useQuery<Tag[]>({
    queryKey: [`/api/projects/${projectId}/tags`],
  });

  // Current card tags
  const cardTagIds = card.tags.map(ct => ct.tag.id);
  const availableTags = allTags.filter(tag => !cardTagIds.includes(tag.id));

  // Create new tag
  const createTagMutation = useMutation({
    mutationFn: async (tagData: { name: string; color: string }) => {
      return await apiRequest(`/api/projects/${projectId}/tags`, {
        method: "POST",
        body: JSON.stringify(tagData),
      });
    },
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tags`] });
      addTagToCard(newTag.id);
      setNewTagName("");
      setIsCreating(false);
    },
  });

  // Add tag to card
  const addTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      return await apiRequest(`/api/cards/${card.id}/tags`, {
        method: "POST",
        body: JSON.stringify({ tagId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({ title: "Tag adicionada ao cartão!" });
    },
  });

  // Remove tag from card
  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      return await apiRequest(`/api/cards/${card.id}/tags/${tagId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({ title: "Tag removida do cartão!" });
    },
  });

  const addTagToCard = (tagId: string) => {
    addTagMutation.mutate(tagId);
  };

  const removeTagFromCard = (tagId: string) => {
    removeTagMutation.mutate(tagId);
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTagMutation.mutate({
      name: newTagName.trim(),
      color: newTagColor,
    });
  };

  return (
    <div className="space-y-3">
      <Label>Tags</Label>
      
      {/* Current tags */}
      <div className="flex flex-wrap gap-2">
        {card.tags.map((cardTag) => (
          <Badge
            key={cardTag.tag.id}
            variant="secondary"
            style={{ backgroundColor: cardTag.tag.color + "20", color: cardTag.tag.color }}
            className="flex items-center gap-1"
          >
            {cardTag.tag.name}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTagFromCard(cardTag.tag.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {/* Add tag popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Plus className="h-3 w-3 mr-1" />
            Adicionar Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-medium">Adicionar Tag</h4>
            
            {/* Available tags */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Tags Disponíveis</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Button
                      key={tag.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addTagToCard(tag.id)}
                      className="h-7 text-xs"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Create new tag */}
            <div className="space-y-2 border-t pt-3">
              <Label className="text-sm">Criar Nova Tag</Label>
              {!isCreating ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating(true)}
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nova Tag
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Nome da tag"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                  />
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim() || createTagMutation.isPending}
                    >
                      Criar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCreating(false);
                        setNewTagName("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
