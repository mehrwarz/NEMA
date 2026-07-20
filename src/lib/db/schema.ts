import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** Site-wide configuration stored in DB for easy CMS-like editing */
export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Subject areas displayed in the "Explore our Subject Areas" grid */
export const subjectAreas = pgTable("subject_areas", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).notNull(),
  colorScheme: varchar("color_scheme", { length: 30 }).notNull().default("blue"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Learning paths (Primary, College, Self-Learner cards) */
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  subtitle: varchar("subtitle", { length: 200 }),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Contact form submissions */
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Users table for learner login and registration */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Trainings */
export const trainings = pgTable("trainings", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Lectures/Videos database */
export const lectures = pgTable("lectures", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Mathematics", "Computer Science", "Physics"
  trainingId: integer("training_id")
    .references(() => trainings.id, { onDelete: "cascade" }),
  videoUrl: text("video_url").notNull(), // YouTube/Vimeo embed or direct video link
  duration: integer("duration").notNull(), // duration in seconds
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** User Enrollments */
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  trainingId: integer("training_id")
    .notNull()
    .references(() => trainings.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

/** User learning progress tracking */
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lectureId: integer("lecture_id")
    .notNull()
    .references(() => lectures.id, { onDelete: "cascade" }),
  watchedDuration: integer("watched_duration").notNull().default(0), // in seconds
  completed: boolean("completed").notNull().default(false),
  lastWatchedAt: timestamp("last_watched_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Comments  */
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resourceId: integer("resource_id")
    .notNull()
    .references(() => lectures.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});