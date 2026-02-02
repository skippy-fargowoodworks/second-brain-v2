/*
  Warnings:

  - You are about to drop the `activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `credentials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `working_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `date` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `keyPoints` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `participants` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `task_activities` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `tasks` table. All the data in the column will be lost.
  - You are about to alter the column `priority` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `title` to the `conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `task_activities` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "activity_createdAt_idx";

-- DropIndex
DROP INDEX "credentials_service_idx";

-- DropIndex
DROP INDEX "working_messages_createdAt_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "activity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "credentials";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "working_messages";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "vault_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "working_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "author" TEXT NOT NULL DEFAULT 'skippy',
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_conversations" ("createdAt", "id", "summary") SELECT "createdAt", "id", "summary" FROM "conversations";
DROP TABLE "conversations";
ALTER TABLE "new_conversations" RENAME TO "conversations";
CREATE TABLE "new_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_notes" ("content", "createdAt", "id", "title", "updatedAt") SELECT "content", "createdAt", "id", "title", "updatedAt" FROM "notes";
DROP TABLE "notes";
ALTER TABLE "new_notes" RENAME TO "notes";
CREATE INDEX "notes_tags_idx" ON "notes"("tags");
CREATE TABLE "new_task_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_activities_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_task_activities" ("createdAt", "id", "taskId") SELECT "createdAt", "id", "taskId" FROM "task_activities";
DROP TABLE "task_activities";
ALTER TABLE "new_task_activities" RENAME TO "task_activities";
CREATE INDEX "task_activities_taskId_createdAt_idx" ON "task_activities"("taskId", "createdAt");
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_tasks" ("createdAt", "description", "id", "priority", "status", "title", "updatedAt") SELECT "createdAt", "description", "id", "priority", "status", "title", "updatedAt" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE INDEX "tasks_priority_idx" ON "tasks"("priority");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "vault_entries_service_idx" ON "vault_entries"("service");

-- CreateIndex
CREATE INDEX "working_notes_createdAt_idx" ON "working_notes"("createdAt");
