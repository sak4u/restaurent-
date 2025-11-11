-- AlterTable
ALTER TABLE "Cuisinier" ALTER COLUMN "codeUnique" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Serveur" ALTER COLUMN "codeUnique" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" INTEGER,
    "serveurId" INTEGER,
    "cuisinierId" INTEGER,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_serveurId_fkey" FOREIGN KEY ("serveurId") REFERENCES "Serveur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_cuisinierId_fkey" FOREIGN KEY ("cuisinierId") REFERENCES "Cuisinier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
