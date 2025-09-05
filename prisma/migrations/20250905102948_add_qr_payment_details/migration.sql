-- AlterTable
ALTER TABLE "public"."Receipt" ADD COLUMN     "buyerEmail" TEXT,
ADD COLUMN     "buyerName" TEXT,
ADD COLUMN     "buyerPhone" TEXT,
ADD COLUMN     "productId" INTEGER,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "quantity" INTEGER,
ADD COLUMN     "shippingAddress" TEXT;
