-- DropForeignKey
ALTER TABLE "GenerationLog" DROP CONSTRAINT "GenerationLog_userId_fkey";

-- AlterTable
ALTER TABLE "GenerationLog" ADD COLUMN     "anonymousSessionId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "GenerationLog_anonymousSessionId_idx" ON "GenerationLog"("anonymousSessionId");

-- AddForeignKey
ALTER TABLE "GenerationLog" ADD CONSTRAINT "GenerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
