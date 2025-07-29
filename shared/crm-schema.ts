
import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, text, timestamp, integer, boolean, decimal, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "sales_agent", "rental_agent"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "qualified", "visit_scheduled", "proposal_sent", "negotiating", "closed_won", "closed_lost"]);
export const propertyTypeEnum = pgEnum("property_type", ["apartment", "house", "commercial", "land", "industrial"]);
export const propertyStatusEnum = pgEnum("property_status", ["available", "reserved", "sold", "rented", "maintenance"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["sale", "rental"]);

// People table
export const people = pgTable("people", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  cpfCnpj: varchar("cpf_cnpj", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  notes: text("notes"),
  isClient: boolean("is_client").default(false),
  isAgent: boolean("is_agent").default(false),
  role: userRoleEnum("role"),
  teamId: uuid("team_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: propertyTypeEnum("type").notNull(),
  status: propertyStatusEnum("status").default("available"),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }),
  rentalPrice: decimal("rental_price", { precision: 12, scale: 2 }),
  area: decimal("area", { precision: 8, scale: 2 }),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  parkingSpaces: integer("parking_spaces"),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  ownerId: uuid("owner_id"),
  agentId: uuid("agent_id"),
  images: text("images"), // JSON array of image URLs
  features: text("features"), // JSON array of features
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  managerId: uuid("manager_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pipeline stages table
export const pipelineStages = pgTable("pipeline_stages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  position: integer("position").notNull(),
  color: varchar("color", { length: 7 }),
  isDefault: boolean("is_default").default(false),
  teamId: uuid("team_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: leadStatusEnum("status").default("new"),
  score: integer("score"), // Lead scoring
  source: varchar("source", { length: 100 }), // Website, referral, etc.
  budget: decimal("budget", { precision: 12, scale: 2 }),
  personId: uuid("person_id"), // Contact person
  propertyId: uuid("property_id"), // Property of interest
  agentId: uuid("agent_id"), // Assigned agent
  teamId: uuid("team_id"),
  stageId: uuid("stage_id"), // Current pipeline stage
  expectedCloseDate: timestamp("expected_close_date"),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  customFields: text("custom_fields"), // JSON for custom fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead activities table
export const leadActivities = pgTable("lead_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // call, email, visit, etc.
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  agentId: uuid("agent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commissions table
export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id"),
  propertyId: uuid("property_id"),
  agentId: uuid("agent_id").notNull(),
  transactionValue: decimal("transaction_value", { precision: 12, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull(), // Percentage
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").default(false),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Automations table
export const automations = pgTable("automations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  trigger: text("trigger").notNull(), // JSON configuration
  actions: text("actions").notNull(), // JSON array of actions
  isActive: boolean("is_active").default(true),
  teamId: uuid("team_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const peopleRelations = relations(people, ({ one, many }) => ({
  team: one(teams, {
    fields: [people.teamId],
    references: [teams.id],
  }),
  ownedProperties: many(properties, { relationName: "PropertyOwner" }),
  assignedProperties: many(properties, { relationName: "PropertyAgent" }),
  leads: many(leads),
  activities: many(leadActivities),
  commissions: many(commissions),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(people, {
    fields: [properties.ownerId],
    references: [people.id],
    relationName: "PropertyOwner",
  }),
  agent: one(people, {
    fields: [properties.agentId],
    references: [people.id],
    relationName: "PropertyAgent",
  }),
  leads: many(leads),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  manager: one(people, {
    fields: [teams.managerId],
    references: [people.id],
  }),
  members: many(people),
  stages: many(pipelineStages),
  leads: many(leads),
  automations: many(automations),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  person: one(people, {
    fields: [leads.personId],
    references: [people.id],
  }),
  property: one(properties, {
    fields: [leads.propertyId],
    references: [properties.id],
  }),
  agent: one(people, {
    fields: [leads.agentId],
    references: [people.id],
  }),
  team: one(teams, {
    fields: [leads.teamId],
    references: [teams.id],
  }),
  stage: one(pipelineStages, {
    fields: [leads.stageId],
    references: [pipelineStages.id],
  }),
  activities: many(leadActivities),
  commissions: many(commissions),
}));

export const leadActivitiesRelations = relations(leadActivities, ({ one }) => ({
  lead: one(leads, {
    fields: [leadActivities.leadId],
    references: [leads.id],
  }),
  agent: one(people, {
    fields: [leadActivities.agentId],
    references: [people.id],
  }),
}));

export const pipelineStagesRelations = relations(pipelineStages, ({ one, many }) => ({
  team: one(teams, {
    fields: [pipelineStages.teamId],
    references: [teams.id],
  }),
  leads: many(leads),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  lead: one(leads, {
    fields: [commissions.leadId],
    references: [leads.id],
  }),
  property: one(properties, {
    fields: [commissions.propertyId],
    references: [properties.id],
  }),
  agent: one(people, {
    fields: [commissions.agentId],
    references: [people.id],
  }),
}));

export const automationsRelations = relations(automations, ({ one }) => ({
  team: one(teams, {
    fields: [automations.teamId],
    references: [teams.id],
  }),
}));
