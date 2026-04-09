-- CreateEnum
CREATE TYPE "StreamingPlatFormEnum" AS ENUM ('NETFLIX', 'AMAZON_PRIME', 'DISNEY_PLUS', 'HBO_MAX', 'HULU', 'APPLE_TV', 'YOUTUBE', 'OTHER');

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "streamingPlatFrom" "StreamingPlatFormEnum" DEFAULT 'YOUTUBE';
