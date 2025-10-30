// menu.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { AddProduitsToMenuDto } from './dto/add-produit.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDto) {
    const { nom } = createMenuDto;

    const menu = await this.prisma.menu.create({
      data: {
        nom
      }});
    return menu;
  }

    async addProduits(menuId: number, dto: AddProduitsToMenuDto) {
  return this.prisma.menu.update({
    where: { id: menuId },
    data: {
      produits: {
        create: dto.produitIds.map((produitId) => ({
          produit: { connect: { id: produitId } },
        })),
      },
    },
    include: {
      produits: {
        include: { produit: true },
      },
    },
  });
}

    async getMenuWithProducts(menuId: number) {
        const menu = await this.prisma.menu.findUnique({
            where: { id: menuId },
            include: { produits: true },
        });
        return menu;
    }
    async getAllMenus() {
        return this.prisma.menu.findMany({
          include: {
            produits: {
              include: {
                produit: true, 
              }
            }
          }
        });
       }
} 
