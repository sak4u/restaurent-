import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommandeService } from '../commande/commande.service';
import { CreateFactureDto } from './dto/create-facture.dto';
import { UpdateFactureDto } from './dto/update-facture.dot';
import { Facture } from '@prisma/client'; // adapte le chemin selon l’emplacement de ton service

@Injectable()
export class FactureService {
  constructor(
    private prisma: PrismaService,
    private commandeService: CommandeService
  ) {}

  // Créer une facture pour une commande
  async create(createFactureDto: CreateFactureDto): Promise<Facture> {
    const { commandeId, montant } = createFactureDto;

    // Vérifier que la commande existe
    

    // Calculer le montant si non fourni
    const montantFacture = montant ?? await this.commandeService.calculateTotal(commandeId);

    return this.prisma.facture.create({
      data: {
        commandeId,
        montant: montantFacture
      },
      include: {
        commande: {
          include: {
            plats: {
              include: {
                produit: true
              }
            },
            table: {
              include: {
                carre: true
              }
            },
            serveur: true
          }
        }
      }
    });
  }

  // Récupérer toutes les factures
  async findAll(): Promise<Facture[]> {
    return this.prisma.facture.findMany({
      include: {
        commande: {
          include: {
            plats: {
              include: {
                produit: true
              }
            },
            table: {
              include: {
                carre: true
              }
            },
            serveur: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  // Récupérer une facture par ID
  async findOne(id: number): Promise<Facture> {
    const facture = await this.prisma.facture.findUnique({
      where: { id },
      include: {
        commande: {
          include: {
            plats: {
              include: {
                produit: true
              }
            },
            table: {
              include: {
                carre: true
              }
            },
            serveur: true
          }
        }
      }
    });

    if (!facture) {
      throw new NotFoundException(`Facture avec ID ${id} introuvable`);
    }

    return facture;
  }

  // Récupérer une facture par commande
  async findByCommande(commandeId: number): Promise<Facture> {
    const facture = await this.prisma.facture.findUnique({
      where: { commandeId },
      include: {
        commande: {
          include: {
            plats: {
              include: {
                produit: true
              }
            },
            table: {
              include: {
                carre: true
              }
            },
            serveur: true
          }
        }
      }
    });

    if (!facture) {
      throw new NotFoundException(`Aucune facture trouvée pour la commande ${commandeId}`);
    }

    return facture;
  }

  // Récupérer les factures par période
  async findByDateRange(startDate: Date, endDate: Date): Promise<Facture[]> {
    return this.prisma.facture.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        commande: {
          include: {
            plats: {
              include: {
                produit: true
              }
            },
            table: {
              include: {
                carre: true
              }
            },
            serveur: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  // Mettre à jour une facture
  async update(id: number, updateFactureDto: UpdateFactureDto): Promise<Facture> {
    const facture = await this.findOne(id);

    return this.prisma.facture.update({
      where: { id },
      data: updateFactureDto,
      include: {
        commande: {
          include: {
            plats: {
              include: {
                produit: true
              }
            },
            table: {
              include: {
                carre: true
              }
            },
            serveur: true
          }
        }
      }
    });
  }

  // Supprimer une facture
  async remove(id: number): Promise<Facture> {
    const facture = await this.findOne(id);

    return this.prisma.facture.delete({
      where: { id },
      include: {
        commande: {
          include: {
            plats: {
              include: {
                produit: true
              }
            },
            table: true,
            serveur: true
          }
        }
      }
    });
  }

  // Calculer le chiffre d'affaires total
  async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.facture.aggregate({
      _sum: {
        montant: true
      }
    });
    return result._sum.montant || 0;
  }

  // Calculer le chiffre d'affaires par période
  async getRevenueByPeriod(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.facture.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        montant: true
      }
    });
    return result._sum.montant || 0;
  }
}
