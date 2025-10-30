// produit.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProduitDto } from './dto/create-produit.dto';

@Injectable()
export class ProduitService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProduitDto) {
    return this.prisma.produit.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.produit.findMany({
      include: { menus: true },
    });
  }
}
