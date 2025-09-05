-- DropForeignKey
ALTER TABLE "public"."Receipt" DROP CONSTRAINT "Receipt_orderId_fkey";

-- AlterTable
ALTER TABLE "public"."Receipt" ADD COLUMN     "paymentType" TEXT NOT NULL DEFAULT 'order_payment',
ALTER COLUMN "orderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Receipt" ADD CONSTRAINT "Receipt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
