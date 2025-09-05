-- AddForeignKey
ALTER TABLE "public"."Receipt" ADD CONSTRAINT "Receipt_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
