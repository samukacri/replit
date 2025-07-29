import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertProjectSchema,
  insertColumnSchema,
  insertCardSchema,
  insertTagSchema,
  insertEntitySchema,
  insertChecklistItemSchema,
  insertCommentSchema,
  insertAttachmentSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";

// WebSocket connections tracking
const wsConnections = new Map<string, Set<WebSocket>>();

// Multer configuration for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// Broadcast to all connected clients in a project
function broadcastToProject(projectId: string, message: any) {
  const connections = wsConnections.get(projectId);
  if (connections) {
    const messageStr = JSON.stringify(message);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const projectId = url.searchParams.get('projectId');

    if (projectId) {
      if (!wsConnections.has(projectId)) {
        wsConnections.set(projectId, new Set());
      }
      wsConnections.get(projectId)!.add(ws);

      ws.on('close', () => {
        const connections = wsConnections.get(projectId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            wsConnections.delete(projectId);
          }
        }
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          // Echo message to all other clients in the project
          broadcastToProject(projectId, {
            ...message,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      // TODO: Get userId from session/auth
      const userId = "550e8400-e29b-41d4-a716-446655440000"; // Replace with actual user ID from auth
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      await storage.logActivity({
        action: "project_created",
        description: `Project "${project.name}" was created`,
        projectId: project.id,
        userId: project.ownerId,
        metadata: { projectName: project.name },
      });

      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, updates);
      
      broadcastToProject(id, {
        type: "project_updated",
        data: project,
      });

      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Column routes
  app.get("/api/projects/:projectId/columns", async (req, res) => {
    try {
      const { projectId } = req.params;
      const columns = await storage.getColumns(projectId);
      res.json(columns);
    } catch (error) {
      console.error("Error fetching columns:", error);
      res.status(500).json({ message: "Failed to fetch columns" });
    }
  });

  app.post("/api/projects/:projectId/columns", async (req, res) => {
    try {
      const { projectId } = req.params;
      const columnData = insertColumnSchema.parse({ ...req.body, projectId });
      const column = await storage.createColumn(columnData);
      
      broadcastToProject(projectId, {
        type: "column_created",
        data: column,
      });

      res.status(201).json(column);
    } catch (error) {
      console.error("Error creating column:", error);
      res.status(400).json({ message: "Failed to create column" });
    }
  });

  app.patch("/api/columns/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertColumnSchema.partial().parse(req.body);
      const column = await storage.updateColumn(id, updates);
      
      // Get project ID for broadcasting
      const columns = await storage.getColumns(column.projectId);
      const projectId = column.projectId;

      broadcastToProject(projectId, {
        type: "column_updated",
        data: column,
      });

      res.json(column);
    } catch (error) {
      console.error("Error updating column:", error);
      res.status(400).json({ message: "Failed to update column" });
    }
  });

  app.post("/api/projects/:projectId/columns/reorder", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { columnOrders } = z.object({
        columnOrders: z.array(z.object({
          id: z.string(),
          position: z.number(),
        }))
      }).parse(req.body);

      await storage.reorderColumns(projectId, columnOrders);
      
      broadcastToProject(projectId, {
        type: "columns_reordered",
        data: columnOrders,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error reordering columns:", error);
      res.status(400).json({ message: "Failed to reorder columns" });
    }
  });

  // Card routes
  app.get("/api/cards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const card = await storage.getCard(id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      res.json(card);
    } catch (error) {
      console.error("Error fetching card:", error);
      res.status(500).json({ message: "Failed to fetch card" });
    }
  });

  app.post("/api/columns/:columnId/cards", async (req, res) => {
    try {
      const { columnId } = req.params;
      const cardData = insertCardSchema.parse({ ...req.body, columnId });
      const card = await storage.createCard(cardData);
      
      // Get project ID for broadcasting
      const column = await storage.getColumns(card.columnId);
      const projectId = column[0]?.projectId; // Assuming we can get project ID this way

      broadcastToProject(projectId, {
        type: "card_created",
        data: card,
      });

      await storage.logActivity({
        action: "card_created",
        description: `Card "${card.title}" was created`,
        cardId: card.id,
        userId: card.createdById,
        metadata: { cardTitle: card.title },
      });

      res.status(201).json(card);
    } catch (error) {
      console.error("Error creating card:", error);
      res.status(400).json({ message: "Failed to create card" });
    }
  });

  app.patch("/api/cards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertCardSchema.partial().parse(req.body);
      const card = await storage.updateCard(id, updates);
      
      // Get project ID for broadcasting (you'd need to implement this)
      // const projectId = await getProjectIdFromCard(id);

      // broadcastToProject(projectId, {
      //   type: "card_updated",
      //   data: card,
      // });

      res.json(card);
    } catch (error) {
      console.error("Error updating card:", error);
      res.status(400).json({ message: "Failed to update card" });
    }
  });

  app.post("/api/cards/:id/move", async (req, res) => {
    try {
      const { id } = req.params;
      const { columnId, position } = z.object({
        columnId: z.string(),
        position: z.number(),
      }).parse(req.body);

      await storage.moveCard(id, columnId, position);
      
      // Get project ID for broadcasting
      // const projectId = await getProjectIdFromCard(id);

      // broadcastToProject(projectId, {
      //   type: "card_moved",
      //   data: { cardId: id, columnId, position },
      // });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error moving card:", error);
      res.status(400).json({ message: "Failed to move card" });
    }
  });

  // Tag routes
  app.get("/api/projects/:projectId/tags", async (req, res) => {
    try {
      const { projectId } = req.params;
      const tags = await storage.getTags(projectId);
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.post("/api/projects/:projectId/tags", async (req, res) => {
    try {
      const { projectId } = req.params;
      const tagData = insertTagSchema.parse({ ...req.body, projectId });
      const tag = await storage.createTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(400).json({ message: "Failed to create tag" });
    }
  });

  // Entity routes
  app.get("/api/projects/:projectId/entities", async (req, res) => {
    try {
      const { projectId } = req.params;
      const entities = await storage.getEntities(projectId);
      res.json(entities);
    } catch (error) {
      console.error("Error fetching entities:", error);
      res.status(500).json({ message: "Failed to fetch entities" });
    }
  });

  app.post("/api/projects/:projectId/entities", async (req, res) => {
    try {
      const { projectId } = req.params;
      const entityData = insertEntitySchema.parse({ ...req.body, projectId });
      const entity = await storage.createEntity(entityData);
      res.status(201).json(entity);
    } catch (error) {
      console.error("Error creating entity:", error);
      res.status(400).json({ message: "Failed to create entity" });
    }
  });

  // Checklist routes
  app.post("/api/cards/:cardId/checklist", async (req, res) => {
    try {
      const { cardId } = req.params;
      const itemData = insertChecklistItemSchema.parse({ ...req.body, cardId });
      const item = await storage.createChecklistItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating checklist item:", error);
      res.status(400).json({ message: "Failed to create checklist item" });
    }
  });

  app.patch("/api/checklist/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertChecklistItemSchema.partial().parse(req.body);
      const item = await storage.updateChecklistItem(id, updates);
      res.json(item);
    } catch (error) {
      console.error("Error updating checklist item:", error);
      res.status(400).json({ message: "Failed to update checklist item" });
    }
  });

  // Comment routes
  app.post("/api/cards/:cardId/comments", async (req, res) => {
    try {
      const { cardId } = req.params;
      // TODO: Get userId from session/auth
      const userId = "550e8400-e29b-41d4-a716-446655440000";
      const commentData = insertCommentSchema.parse({ 
        ...req.body, 
        cardId,
        authorId: userId,
      });
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  // File upload routes
  app.post("/api/cards/:cardId/attachments", upload.single('file'), async (req, res) => {
    try {
      const { cardId } = req.params;
      // TODO: Get userId from session/auth
      const userId = "550e8400-e29b-41d4-a716-446655440000";
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const attachmentData = insertAttachmentSchema.parse({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        cardId,
        uploadedById: userId,
      });

      const attachment = await storage.createAttachment(attachmentData);
      res.status(201).json(attachment);
    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(400).json({ message: "Failed to upload attachment" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  return httpServer;
}
