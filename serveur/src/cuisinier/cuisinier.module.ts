import { Module } from "@nestjs/common";
import { CuisinierController } from "./cuisinier.controller";
import { CuisinierService } from "./cuisinier.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    controllers: [CuisinierController],
    providers: [CuisinierService, PrismaService],
})
export class CuisinierModule {}