import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCarreDto } from './dto/create.carre';
import { UpdateCarreDto } from './dto/update.carre.dto';

@Injectable()
export class CarreService {
  constructor(private prisma: PrismaService) {}

  async create(createCarreDto: CreateCarreDto) {
  const { nom, serveurId, count } = createCarreDto;

  // 1. Créer le Carre
  const carre = await this.prisma.carre.create({
    data: {
      nom,
      serveur: { connect: { id: serveurId } },
    },
  });

  // 2. Générer les tables automatiquement
  const tables = Array.from({ length: count }, (_, i) => ({
    numero: i + 1,
    carreId: carre.id,
  }));

  await this.prisma.table.createMany({ data: tables });

  // 3. Retourner le Carre avec ses tables
  const createdCarre = await this.prisma.carre.findUnique({
    where: { id: carre.id },
    include: { tables: true },
  });

  return createdCarre;
}

  async findAll() {
    return this.prisma.carre.findMany({
      include: { tables: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.carre.findUnique({
      where: { id },
      include: { tables: true },
    });
  }

 async update(id: number, updateCarreDto: UpdateCarreDto) {
  const { nom, serveurId, count } = updateCarreDto;

  // 1. Récupérer le carré avec ses tables actuelles
  const existingCarre = await this.prisma.carre.findUnique({
    where: { id },
    include: { tables: true },
  });

  if (!existingCarre) {
    throw new Error('Carré non trouvé');
  }

  // 2. Mettre à jour les champs nom et serveur
  await this.prisma.carre.update({
    where: { id },
    data: {
      nom,
      serveur: serveurId ? { connect: { id: serveurId } } : undefined,
    },
  });

  // 3. Si count est fourni, gérer les tables
  if (count !== undefined) {
    const currentCount = existingCarre.tables.length;

    if (count > currentCount) {
      // Ajouter les tables manquantes
      const tablesToAdd = Array.from({ length: count - currentCount }, (_, i) => ({
        numero: currentCount + i + 1,
        carreId: id,
      }));
      await this.prisma.table.createMany({ data: tablesToAdd });
    } else if (count < currentCount) {
      // Supprimer les tables en trop
      const tableIdsToDelete = existingCarre.tables
        .filter((t) => t.numero > count)
        .map((t) => t.id);

      await this.prisma.table.deleteMany({
        where: { id: { in: tableIdsToDelete } },
      });
    }
  }

  // 4. Retourner le carré mis à jour avec ses tables
  return this.prisma.carre.findUnique({
    where: { id },
    include: { tables: true },
  });
}

  async remove(id: number) {
    return this.prisma.carre.delete({
      where: { id },
    });
  }
  async findbyserveurId(serveurId: number) {
    return this.prisma.carre.findMany({
      where: { serveurId : serveurId  },
      include: { tables: true },
    });
  }
}


