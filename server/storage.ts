import {
  users,
  projects,
  columns,
  cards,
  tags,
  cardTags,
  entities,
  cardEntities,
  checklistItems,
  comments,
  attachments,
  activityLog,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Column,
  type InsertColumn,
  type Card,
  type InsertCard,
  type CardWithRelations,
  type ColumnWithCards,
  type ProjectWithRelations,
  type Tag,
  type InsertTag,
  type Entity,
  type InsertEntity,
  type ChecklistItem,
  type InsertChecklistItem,
  type Comment,
  type InsertComment,
  type Attachment,
  type InsertAttachment,
  type ActivityLog,
  type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<ProjectWithRelations | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Column operations
  getColumns(projectId: string): Promise<ColumnWithCards[]>;
  createColumn(column: InsertColumn): Promise<Column>;
  updateColumn(id: string, updates: Partial<InsertColumn>): Promise<Column>;
  deleteColumn(id: string): Promise<void>;
  reorderColumns(projectId: string, columnOrders: { id: string; position: number }[]): Promise<void>;

  // Card operations
  getCard(id: string): Promise<CardWithRelations | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: string, updates: Partial<InsertCard>): Promise<Card>;
  deleteCard(id: string): Promise<void>;
  moveCard(cardId: string, columnId: string, position: number): Promise<void>;
  reorderCards(columnId: string, cardOrders: { id: string; position: number }[]): Promise<void>;
  getCardsByColumn(columnId: string): Promise<Card[]>;

  // Tag operations
  getTags(projectId: string): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  addTagToCard(cardId: string, tagId: string): Promise<void>;
  removeTagFromCard(cardId: string, tagId: string): Promise<void>;

  // Entity operations
  getEntities(projectId: string): Promise<Entity[]>;
  createEntity(entity: InsertEntity): Promise<Entity>;
  linkEntityToCard(cardId: string, entityId: string): Promise<void>;
  unlinkEntityFromCard(cardId: string, entityId: string): Promise<void>;

  // Checklist operations
  getChecklistItems(cardId: string): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: string, updates: Partial<InsertChecklistItem>): Promise<ChecklistItem>;
  deleteChecklistItem(id: string): Promise<void>;

  // Comment operations
  getComments(cardId: string): Promise<(Comment & { author: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Attachment operations
  getAttachments(cardId: string): Promise<(Attachment & { uploadedBy: User })[]>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: string): Promise<void>;

  // Activity log operations
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivityLog(cardId?: string, projectId?: string, limit?: number): Promise<(ActivityLog & { user: User })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Project operations
  async getProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.ownerId, userId)).orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<ProjectWithRelations | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .where(eq(projects.id, id));

    if (!project) return undefined;

    const projectColumns = await this.getColumns(id);
    const projectTags = await this.getTags(id);
    const projectEntities = await this.getEntities(id);

    const totalCards = projectColumns.reduce((sum, col) => sum + col.cards.length, 0);
    const completedCards = projectColumns.reduce(
      (sum, col) => sum + col.cards.filter(card => card.completed).length,
      0
    );

    return {
      ...project.projects,
      owner: project.users!,
      columns: projectColumns,
      tags: projectTags,
      entities: projectEntities,
      _count: {
        cards: totalCards,
        completedCards,
      },
    };
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(projectData).returning();

    // Create default columns
    const defaultColumns = [
      { name: "Backlog", color: "#6B7280", position: 0, projectId: project.id },
      { name: "Em Progresso", color: "#3B82F6", position: 1, projectId: project.id },
      { name: "Em Revisão", color: "#F59E0B", position: 2, projectId: project.id },
      { name: "Concluído", color: "#10B981", position: 3, projectId: project.id },
    ];

    await db.insert(columns).values(defaultColumns);

    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Column operations
  async getColumns(projectId: string): Promise<ColumnWithCards[]> {
    const projectColumns = await db
      .select()
      .from(columns)
      .where(eq(columns.projectId, projectId))
      .orderBy(asc(columns.position));

    const columnsWithCards = await Promise.all(
      projectColumns.map(async (column) => {
        const columnCards = await db
          .select()
          .from(cards)
          .leftJoin(users, eq(cards.assigneeId, users.id))
          .where(eq(cards.columnId, column.id))
          .orderBy(asc(cards.position));

        const cardsWithRelations = await Promise.all(
          columnCards.map(async (cardRow) => {
            const card = cardRow.cards;
            const assignee = cardRow.users;

            // Get created by user
            const [createdByUser] = await db
              .select()
              .from(users)
              .where(eq(users.id, card.createdById));

            // Get card tags
            const cardTagsData = await db
              .select()
              .from(cardTags)
              .leftJoin(tags, eq(cardTags.tagId, tags.id))
              .where(eq(cardTags.cardId, card.id));

            // Get card entities
            const cardEntitiesData = await db
              .select()
              .from(cardEntities)
              .leftJoin(entities, eq(cardEntities.entityId, entities.id))
              .where(eq(cardEntities.cardId, card.id));

            // Get checklist items
            const checklistItemsData = await db
              .select()
              .from(checklistItems)
              .where(eq(checklistItems.cardId, card.id))
              .orderBy(asc(checklistItems.position));

            // Get comments count
            const [commentsCount] = await db
              .select({ count: sql<number>`count(*)` })
              .from(comments)
              .where(eq(comments.cardId, card.id));

            // Get attachments count
            const [attachmentsCount] = await db
              .select({ count: sql<number>`count(*)` })
              .from(attachments)
              .where(eq(attachments.cardId, card.id));

            const completedChecklistItems = checklistItemsData.filter(item => item.completed).length;

            const cardWithRelations: CardWithRelations = {
              ...card,
              assignee: assignee || undefined,
              createdBy: createdByUser,
              tags: cardTagsData.map(ct => ({ ...ct.card_tags, tag: ct.tags! })),
              entities: cardEntitiesData.map(ce => ({ ...ce.card_entities, entity: ce.entities! })),
              checklistItems: checklistItemsData,
              comments: [], // Comments loaded separately when needed
              attachments: [], // Attachments loaded separately when needed
              _count: {
                comments: commentsCount.count,
                attachments: attachmentsCount.count,
                checklistItems: checklistItemsData.length,
                completedChecklistItems,
              },
            };

            return cardWithRelations;
          })
        );

        return {
          ...column,
          cards: cardsWithRelations,
        };
      })
    );

    return columnsWithCards;
  }

  async createColumn(columnData: InsertColumn): Promise<Column> {
    // Get the next position for this project
    const [lastColumn] = await db
      .select({ position: columns.position })
      .from(columns)
      .where(eq(columns.projectId, columnData.projectId))
      .orderBy(desc(columns.position))
      .limit(1);

    const position = lastColumn ? lastColumn.position + 1 : 0;

    const [column] = await db.insert(columns).values({
      ...columnData,
      position,
    }).returning();
    return column;
  }

  async updateColumn(id: string, updates: Partial<InsertColumn>): Promise<Column> {
    const [column] = await db
      .update(columns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(columns.id, id))
      .returning();
    return column;
  }

  async deleteColumn(id: string): Promise<void> {
    await db.delete(columns).where(eq(columns.id, id));
  }

  async reorderColumns(projectId: string, columnOrders: { id: string; position: number }[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const { id, position } of columnOrders) {
        await tx
          .update(columns)
          .set({ position, updatedAt: new Date() })
          .where(and(eq(columns.id, id), eq(columns.projectId, projectId)));
      }
    });
  }

  async getCardsByColumn(columnId: string): Promise<Card[]> {
    return await db.select().from(cards).where(eq(cards.columnId, columnId)).orderBy(asc(cards.position));
  }

  // Card operations
  async getCard(id: string): Promise<CardWithRelations | undefined> {
    const [cardData] = await db
      .select()
      .from(cards)
      .leftJoin(users, eq(cards.assigneeId, users.id))
      .where(eq(cards.id, id));

    if (!cardData) return undefined;

    const card = cardData.cards;
    const assignee = cardData.users;

    // Get created by user
    const [createdByUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, card.createdById));

    // Get all related data
    const cardTagsData = await db
      .select()
      .from(cardTags)
      .leftJoin(tags, eq(cardTags.tagId, tags.id))
      .where(eq(cardTags.cardId, card.id));

    const cardEntitiesData = await db
      .select()
      .from(cardEntities)
      .leftJoin(entities, eq(cardEntities.entityId, entities.id))
      .where(eq(cardEntities.cardId, card.id));

    const checklistItemsData = await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.cardId, card.id))
      .orderBy(asc(checklistItems.position));

    const commentsData = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.cardId, card.id))
      .orderBy(desc(comments.createdAt));

    const attachmentsData = await db
      .select()
      .from(attachments)
      .leftJoin(users, eq(attachments.uploadedById, users.id))
      .where(eq(attachments.cardId, card.id))
      .orderBy(desc(attachments.createdAt));

    const completedChecklistItems = checklistItemsData.filter(item => item.completed).length;

    return {
      ...card,
      assignee: assignee || undefined,
      createdBy: createdByUser,
      tags: cardTagsData.map(ct => ({ ...ct.card_tags, tag: ct.tags! })),
      entities: cardEntitiesData.map(ce => ({ ...ce.card_entities, entity: ce.entities! })),
      checklistItems: checklistItemsData,
      comments: commentsData.map(c => ({ ...c.comments, author: c.users! })),
      attachments: attachmentsData.map(a => ({ ...a.attachments, uploadedBy: a.users! })),
      _count: {
        comments: commentsData.length,
        attachments: attachmentsData.length,
        checklistItems: checklistItemsData.length,
        completedChecklistItems,
      },
    };
  }

  async createCard(cardData: InsertCard): Promise<Card> {
    // Get the next position for this column
    const [lastCard] = await db
      .select({ position: cards.position })
      .from(cards)
      .where(eq(cards.columnId, cardData.columnId))
      .orderBy(desc(cards.position))
      .limit(1);

    const position = lastCard ? lastCard.position + 1 : 0;

    const [card] = await db.insert(cards).values({
      ...cardData,
      position,
    }).returning();
    return card;
  }

  async updateCard(id: string, updates: Partial<InsertCard>): Promise<Card> {
    const [card] = await db
      .update(cards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cards.id, id))
      .returning();
    return card;
  }

  async deleteCard(id: string): Promise<void> {
    await db.delete(cards).where(eq(cards.id, id));
  }

  async moveCard(cardId: string, columnId: string, position: number): Promise<void> {
    await db
      .update(cards)
      .set({ columnId, position, updatedAt: new Date() })
      .where(eq(cards.id, cardId));
  }

  async reorderCards(columnId: string, cardOrders: { id: string; position: number }[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const { id, position } of cardOrders) {
        await tx
          .update(cards)
          .set({ position, updatedAt: new Date() })
          .where(and(eq(cards.id, id), eq(cards.columnId, columnId)));
      }
    });
  }

  // Tag operations
  async getTags(projectId: string): Promise<Tag[]> {
    return await db.select().from(tags).where(eq(tags.projectId, projectId)).orderBy(asc(tags.name));
  }

  async createTag(tagData: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(tagData).returning();
    return tag;
  }

  async addTagToCard(cardId: string, tagId: string): Promise<void> {
    await db.insert(cardTags).values({ cardId, tagId });
  }

  async removeTagFromCard(cardId: string, tagId: string): Promise<void> {
    await db.delete(cardTags).where(and(eq(cardTags.cardId, cardId), eq(cardTags.tagId, tagId)));
  }

  // Entity operations
  async getEntities(projectId: string): Promise<Entity[]> {
    return await db.select().from(entities).where(eq(entities.projectId, projectId)).orderBy(asc(entities.name));
  }

  async createEntity(entityData: InsertEntity): Promise<Entity> {
    const [entity] = await db.insert(entities).values(entityData).returning();
    return entity;
  }

  async linkEntityToCard(cardId: string, entityId: string): Promise<void> {
    await db.insert(cardEntities).values({ cardId, entityId });
  }

  async unlinkEntityFromCard(cardId: string, entityId: string): Promise<void> {
    await db.delete(cardEntities).where(and(eq(cardEntities.cardId, cardId), eq(cardEntities.entityId, entityId)));
  }

  // Checklist operations
  async getChecklistItems(cardId: string): Promise<ChecklistItem[]> {
    return await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.cardId, cardId))
      .orderBy(asc(checklistItems.position));
  }

  async createChecklistItem(itemData: InsertChecklistItem): Promise<ChecklistItem> {
    const [item] = await db.insert(checklistItems).values(itemData).returning();
    return item;
  }

  async updateChecklistItem(id: string, updates: Partial<InsertChecklistItem>): Promise<ChecklistItem> {
    const [item] = await db
      .update(checklistItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(checklistItems.id, id))
      .returning();
    return item;
  }

  async deleteChecklistItem(id: string): Promise<void> {
    await db.delete(checklistItems).where(eq(checklistItems.id, id));
  }

  // Comment operations
  async getComments(cardId: string): Promise<(Comment & { author: User })[]> {
    const commentsData = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.cardId, cardId))
      .orderBy(desc(comments.createdAt));

    return commentsData.map(c => ({ ...c.comments, author: c.users! }));
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  // Attachment operations
  async getAttachments(cardId: string): Promise<(Attachment & { uploadedBy: User })[]> {
    const attachmentsData = await db
      .select()
      .from(attachments)
      .leftJoin(users, eq(attachments.uploadedById, users.id))
      .where(eq(attachments.cardId, cardId))
      .orderBy(desc(attachments.createdAt));

    return attachmentsData.map(a => ({ ...a.attachments, uploadedBy: a.users! }));
  }

  async createAttachment(attachmentData: InsertAttachment): Promise<Attachment> {
    const [attachment] = await db.insert(attachments).values(attachmentData).returning();
    return attachment;
  }

  async deleteAttachment(id: string): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id));
  }

  // Activity log operations
  async logActivity(activityData: InsertActivityLog): Promise<ActivityLog> {
    const [activity] = await db.insert(activityLog).values(activityData).returning();
    return activity;
  }

  async getActivityLog(cardId?: string, projectId?: string, limit: number = 50): Promise<(ActivityLog & { user: User })[]> {
    let query = db
      .select()
      .from(activityLog)
      .leftJoin(users, eq(activityLog.userId, users.id));

    if (cardId) {
      query = query.where(eq(activityLog.cardId, cardId));
    } else if (projectId) {
      query = query.where(eq(activityLog.projectId, projectId));
    }

    const activities = await query
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);

    return activities.map(a => ({ ...a.activity_log, user: a.users! }));
  }
}

export const storage = new DatabaseStorage();