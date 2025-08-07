-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "discountEndDate" TIMESTAMP(3),
ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ADD COLUMN     "discountType" TEXT,
ADD COLUMN     "hasDiscount" BOOLEAN NOT NULL DEFAULT false;
