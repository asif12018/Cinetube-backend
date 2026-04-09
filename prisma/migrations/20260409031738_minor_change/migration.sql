-- AlterTable
ALTER TABLE "media" ALTER COLUMN "isFeatured" DROP NOT NULL,
ALTER COLUMN "isEditorPick" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "personId" TEXT;
