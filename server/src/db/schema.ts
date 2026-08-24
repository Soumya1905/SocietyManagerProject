import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["RESIDENT", "ADMIN"]);
export const complaintStatusEnum = pgEnum("complaint_status", [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
]);
export const complaintPriorityEnum = pgEnum("complaint_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
]);
export const complaintCategoryEnum = pgEnum("complaint_category", [
  "PLUMBING",
  "ELECTRICAL",
  "SECURITY",
  "CLEANLINESS",
  "LIFT",
  "PARKING",
  "WATER_SUPPLY",
  "OTHER",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    apartmentNumber: varchar("apartment_number", { length: 50 }).notNull(),
    role: roleEnum("role").notNull().default("RESIDENT"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("users_email_idx").on(table.email), index("users_role_idx").on(table.role)]
);

export const complaints = pgTable(
  "complaints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    residentId: uuid("resident_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: complaintCategoryEnum("category").notNull(),
    description: text("description").notNull(),
    photoUrl: varchar("photo_url", { length: 500 }),
    status: complaintStatusEnum("status").notNull().default("OPEN"),
    priority: complaintPriorityEnum("priority").notNull().default("MEDIUM"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    index("complaints_resident_id_idx").on(table.residentId),
    index("complaints_status_idx").on(table.status),
    index("complaints_priority_idx").on(table.priority),
    index("complaints_category_idx").on(table.category),
    index("complaints_created_at_idx").on(table.createdAt),
  ]
);

export const complaintHistory = pgTable(
  "complaint_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    complaintId: uuid("complaint_id")
      .notNull()
      .references(() => complaints.id, { onDelete: "cascade" }),
    previousStatus: complaintStatusEnum("previous_status"),
    newStatus: complaintStatusEnum("new_status").notNull(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("complaint_history_complaint_id_idx").on(table.complaintId)]
);

export const notices = pgTable(
  "notices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    isImportant: boolean("is_important").notNull().default(false),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("notices_is_important_idx").on(table.isImportant)]
);

export const usersRelations = relations(users, ({ many }) => ({
  complaints: many(complaints),
  notices: many(notices),
}));

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  resident: one(users, {
    fields: [complaints.residentId],
    references: [users.id],
  }),
  history: many(complaintHistory),
}));

export const complaintHistoryRelations = relations(complaintHistory, ({ one }) => ({
  complaint: one(complaints, {
    fields: [complaintHistory.complaintId],
    references: [complaints.id],
  }),
  actor: one(users, {
    fields: [complaintHistory.actorId],
    references: [users.id],
  }),
}));

export const noticesRelations = relations(notices, ({ one }) => ({
  author: one(users, {
    fields: [notices.createdBy],
    references: [users.id],
  }),
}));
