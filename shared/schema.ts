import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  boolean, 
  integer,
  jsonb,
  uuid,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const viewTypeEnum = pgEnum("view_type", ["kanban", "list", "calendar", "timeline"]);
export const entityTypeEnum = pgEnum("entity_type", ["property", "person", "contract"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#0066CC"),
  icon: varchar("icon", { length: 50 }).default("project-diagram"),
  progress: integer("progress").default(0),
  deadline: timestamp("deadline"),
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Columns table
export const columns = pgTable("columns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 7 }).default("#6B7280"),
  position: integer("position").notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cards table
export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: priorityEnum("priority").default("medium"),
  position: integer("position").notNull(),
  deadline: timestamp("deadline"),
  completed: boolean("completed").default(false),
  columnId: uuid("column_id").references(() => columns.id, { onDelete: "cascade" }).notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id),
  createdById: uuid("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tags table
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Card tags junction table
export const cardTags = pgTable("card_tags", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "cascade" }).notNull(),
  tagId: uuid("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull(),
});

// Entities table (properties, people, contracts)
export const entities = pgTable("entities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  type: entityTypeEnum("type").notNull(),
  data: jsonb("data"), // Flexible data storage for different entity types
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Card entities junction table
export const cardEntities = pgTable("card_entities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "cascade" }).notNull(),
  entityId: uuid("entity_id").references(() => entities.id, { onDelete: "cascade" }).notNull(),
});

// Checklist items table
export const checklistItems = pgTable("checklist_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  completed: boolean("completed").default(false),
  position: integer("position").notNull(),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "cascade" }).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attachments table
export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "cascade" }).notNull(),
  uploadedById: uuid("uploaded_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity log table
export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  action: varchar("action", { length: 100 }).notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedProjects: many(projects),
  assignedCards: many(cards),
  createdCards: many(cards),
  comments: many(comments),
  attachments: many(attachments),
  activities: many(activityLog),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  columns: many(columns),
  tags: many(tags),
  entities: many(entities),
  activities: many(activityLog),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  project: one(projects, {
    fields: [columns.projectId],
    references: [projects.id],
  }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  column: one(columns, {
    fields: [cards.columnId],
    references: [columns.id],
  }),
  assignee: one(users, {
    fields: [cards.assigneeId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [cards.createdById],
    references: [users.id],
  }),
  tags: many(cardTags),
  entities: many(cardEntities),
  checklistItems: many(checklistItems),
  comments: many(comments),
  attachments: many(attachments),
  activities: many(activityLog),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  project: one(projects, {
    fields: [tags.projectId],
    references: [projects.id],
  }),
  cards: many(cardTags),
}));

export const cardTagsRelations = relations(cardTags, ({ one }) => ({
  card: one(cards, {
    fields: [cardTags.cardId],
    references: [cards.id],
  }),
  tag: one(tags, {
    fields: [cardTags.tagId],
    references: [tags.id],
  }),
}));

export const entitiesRelations = relations(entities, ({ one, many }) => ({
  project: one(projects, {
    fields: [entities.projectId],
    references: [projects.id],
  }),
  cards: many(cardEntities),
}));

export const cardEntitiesRelations = relations(cardEntities, ({ one }) => ({
  card: one(cards, {
    fields: [cardEntities.cardId],
    references: [cards.id],
  }),
  entity: one(entities, {
    fields: [cardEntities.entityId],
    references: [entities.id],
  }),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
  card: one(cards, {
    fields: [checklistItems.cardId],
    references: [cards.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  card: one(cards, {
    fields: [comments.cardId],
    references: [cards.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  card: one(cards, {
    fields: [attachments.cardId],
    references: [cards.id],
  }),
  uploadedBy: one(users, {
    fields: [attachments.uploadedById],
    references: [users.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  card: one(cards, {
    fields: [activityLog.cardId],
    references: [cards.id],
  }),
  project: one(projects, {
    fields: [activityLog.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertColumnSchema = createInsertSchema(columns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCardSchema = createInsertSchema(cards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

export const insertEntitySchema = createInsertSchema(entities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Column = typeof columns.$inferSelect;
export type InsertColumn = z.infer<typeof insertColumnSchema>;

export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type Entity = typeof entities.$inferSelect;
export type InsertEntity = z.infer<typeof insertEntitySchema>;

export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Extended types with relations
export type CardWithRelations = Card & {
  assignee?: User;
  createdBy: User;
  tags: (typeof cardTags.$inferSelect & { tag: Tag })[];
  entities: (typeof cardEntities.$inferSelect & { entity: Entity })[];
  checklistItems: ChecklistItem[];
  comments: (Comment & { author: User })[];
  attachments: (Attachment & { uploadedBy: User })[];
  _count?: {
    comments: number;
    attachments: number;
    checklistItems: number;
    completedChecklistItems: number;
  };
};

export type ColumnWithCards = Column & {
  cards: CardWithRelations[];
};

export type ProjectWithRelations = Project & {
  owner: User;
  columns: ColumnWithCards[];
  tags: Tag[];
  entities: Entity[];
  _count?: {
    cards: number;
    completedCards: number;
  };
};