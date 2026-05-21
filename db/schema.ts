import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  json,
  bigint,
  int,
} from "drizzle-orm/mysql-core";

// ===== Users (from auth) =====
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===== Title Items (标题甄选) =====
export const titleItems = mysqlTable("title_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  direction: text("direction").notNull().default(""),
  reference: text("reference").notNull().default(""),
  referenceImages: json("reference_images").$type<string[]>().default([]),
  directorSuggest: text("director_suggest").notNull().default(""),
  directorVote: mysqlEnum("director_vote", ["agree", "pending"]).default("pending").notNull(),
  editorSuggest: text("editor_suggest").notNull().default(""),
  editorVote: mysqlEnum("editor_vote", ["agree", "pending"]).default("pending").notNull(),
  operatorSuggest: text("operator_suggest").notNull().default(""),
  operatorVote: mysqlEnum("operator_vote", ["agree", "pending"]).default("pending").notNull(),
  finalDecision: mysqlEnum("final_decision", ["execute", "reject"]).default("execute").notNull(),
  rowHighlight: mysqlEnum("row_highlight", ["none", "green", "red"]).default("none").notNull(),
  createdAt: varchar("created_at", { length: 20 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type TitleItem = typeof titleItems.$inferSelect;
export type InsertTitleItem = typeof titleItems.$inferInsert;

// ===== Position Tasks (岗位进程) =====
export const positionTasks = mysqlTable("position_tasks", {
  id: serial("id").primaryKey(),
  cardProduct: text("card_product").notNull().default(""),
  topicName: text("topic_name").notNull().default(""),
  publishAccount: text("publish_account").notNull().default(""),
  copywriter: text("copywriter").notNull().default(""),
  copyStartTime: varchar("copy_start_time", { length: 20 }).notNull().default(""),
  copyEndTime: varchar("copy_end_time", { length: 20 }).notNull().default(""),
  videoProducer: text("video_producer").notNull().default(""),
  videoStartTime: varchar("video_start_time", { length: 20 }).notNull().default(""),
  videoEndTime: varchar("video_end_time", { length: 20 }).notNull().default(""),
  publishTime: varchar("publish_time", { length: 30 }).notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PositionTask = typeof positionTasks.$inferSelect;
export type InsertPositionTask = typeof positionTasks.$inferInsert;

// ===== Locked Topics (锁定选题关联) =====
export const lockedTopics = mysqlTable("locked_topics", {
  id: serial("id").primaryKey(),
  topicName: text("topic_name").notNull(),
  lockDate: varchar("lock_date", { length: 20 }).notNull(),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LockedTopic = typeof lockedTopics.$inferSelect;
export type InsertLockedTopic = typeof lockedTopics.$inferInsert;
