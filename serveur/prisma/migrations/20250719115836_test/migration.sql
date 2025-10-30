-- CreateEnum
CREATE TYPE "ProduitType" AS ENUM ('FORMULE', 'PLAT', 'EXTRA');

-- CreateEnum
CREATE TYPE "EtatPreparation" AS ENUM ('COMMANDE', 'PREPARE');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Serveur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "photoUrl" TEXT,
    "codeUnique" VARCHAR(8) NOT NULL,

    CONSTRAINT "Serveur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuisinier" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "photoUrl" TEXT,
    "codeUnique" VARCHAR(8) NOT NULL,

    CONSTRAINT "Cuisinier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carre" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "serveurId" INTEGER,

    CONSTRAINT "Carre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "carreId" INTEGER NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER NOT NULL,
    "serveurId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatCommande" (
    "id" SERIAL NOT NULL,
    "commandeId" INTEGER NOT NULL,
    "produitId" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "etatPreparation" "EtatPreparation" NOT NULL DEFAULT 'COMMANDE',

    CONSTRAINT "PlatCommande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" SERIAL NOT NULL,
    "commandeId" INTEGER NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProduitMenu" (
    "id" SERIAL NOT NULL,
    "menuId" INTEGER NOT NULL,
    "produitId" INTEGER NOT NULL,

    CONSTRAINT "ProduitMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "type" "ProduitType" NOT NULL,
    "photoUrl" TEXT,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContenuFormule" (
    "id" SERIAL NOT NULL,
    "formuleId" INTEGER NOT NULL,
    "produitId" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "ContenuFormule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Serveur_email_key" ON "Serveur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Serveur_codeUnique_key" ON "Serveur"("codeUnique");

-- CreateIndex
CREATE UNIQUE INDEX "Cuisinier_email_key" ON "Cuisinier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cuisinier_codeUnique_key" ON "Cuisinier"("codeUnique");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_commandeId_key" ON "Facture"("commandeId");

-- AddForeignKey
ALTER TABLE "Carre" ADD CONSTRAINT "Carre_serveurId_fkey" FOREIGN KEY ("serveurId") REFERENCES "Serveur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_carreId_fkey" FOREIGN KEY ("carreId") REFERENCES "Carre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_serveurId_fkey" FOREIGN KEY ("serveurId") REFERENCES "Serveur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatCommande" ADD CONSTRAINT "PlatCommande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatCommande" ADD CONSTRAINT "PlatCommande_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduitMenu" ADD CONSTRAINT "ProduitMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduitMenu" ADD CONSTRAINT "ProduitMenu_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContenuFormule" ADD CONSTRAINT "ContenuFormule_formuleId_fkey" FOREIGN KEY ("formuleId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContenuFormule" ADD CONSTRAINT "ContenuFormule_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
