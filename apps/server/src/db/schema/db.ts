import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const rateLimit = pgTable("rate_limit", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  requestCount: integer("request_count").notNull().default(0),
  windowStart: timestamp("window_start").notNull(),
  windowEnd: timestamp("window_end").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

import { jsonb } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").notNull(),
  model: text("model"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sources: jsonb("sources").default([]), // Store web search sources as array of { url, title }
});

export const chats = pgTable("chat", {
  id: text("id").primaryKey(), // Unique ID for each chat session
  title: text("title").notNull(), // A short title for the chat
  created_at: timestamp("created_at").notNull(),
  public: boolean("public").default(false).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const userInfo = pgTable("userInfo", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name"),
  profession: text("profession"),
  traits: text("traits"),
  user_description: text("user_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table for storing files uploaded to chats
export const chatFiles = pgTable("chat_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: text("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const chatsRelations = relations(chats, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));

export const userInfoRelations = relations(userInfo, ({ one }) => ({
  user: one(user, {
    fields: [userInfo.userId],
    references: [user.id],
  }),
}));
