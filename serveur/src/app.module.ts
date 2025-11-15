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
import { NotificationModule } from "./notification/notification.module";
import { AppController } from "./app.controller";
@Module({
    controllers: [AppController],
    imports: [AdminModule, PrismaModule, ServeurModule,
        CarreModule, MenuModule, ProduitModule,CuisinierModule,FactureModule, AuthModule, NotificationModule],
})
export class AppModule {}