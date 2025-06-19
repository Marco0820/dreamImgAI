/*
  Warnings:

  - You are about to drop the column `anonymousSessionId` on the `GenerationLog` table. All the data in the column will be lost.
  - Made the column `userId` on table `GenerationLog` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "GenerationLog" DROP CONSTRAINT "GenerationLog_userId_fkey";

-- AlterTable
ALTER TABLE "GenerationLog" DROP COLUMN "anonymousSessionId",
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "creditsUsed" DROP DEFAULT,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "GenerationLog" ADD CONSTRAINT "GenerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
