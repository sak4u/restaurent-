import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ServeurModule } from './serveur/serveur.module';
import { MenuModule } from './menu/menu.module';
import { CarreModule } from "./carre/carre.module";
import { ProduitModule } from "./produit/produit.module"
import { CuisinierModule } from "./cuisinier/cuisinier.module";
import { FactureModule } from "./facture/facture.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [AdminModule, PrismaModule, ServeurModule,
        CarreModule, MenuModule, ProduitModule,CuisinierModule,FactureModule, AuthModule],
})
export class AppModule {}