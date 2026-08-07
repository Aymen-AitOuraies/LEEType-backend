/*
  Warnings:

  - You are about to drop the `UserRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserRating" DROP CONSTRAINT "UserRating_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "UserRating";
