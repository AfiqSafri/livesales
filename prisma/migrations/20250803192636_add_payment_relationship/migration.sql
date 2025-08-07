-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "paymentId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
