import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdatePlatCommandeDto } from './dto/update-commande.dto';
import { CreatePlatCommandeDto } from './dto/create-plat-commande.dto';
import { Commande, PlatCommande, EtatPreparation } from '@prisma/client';
import {NotificationGateway}from '../notification/notification.gateway';

@Injectable()
export class CommandeService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway :NotificationGateway
   ) {}

  // Créer une nouvelle commande avec ses plats
  async create(createCommandeDto: CreateCommandeDto): Promise<Commande> {
    const { tableId, serveurId, plats } = createCommandeDto;

    // Vérifier que la table existe
    const table = await this.prisma.table.findUnique({
      where: { id: tableId }
    });
    if (!table) {
      throw new NotFoundException(`Table avec ID ${tableId} introuvable`);
    }

    // Vérifier que le serveur existe
    const serveur = await this.prisma.serveur.findUnique({
      where: { id: Number(serveurId) }
    });
    if (!serveur) {
      throw new NotFoundException(`Serveur avec ID ${serveurId} introuvable`);
    }

    // Vérifier que tous les produits existent
    const produitIds = plats.map(plat => plat.produitId);
    const produits = await this.prisma.produit.findMany({
      where: { id: { in: produitIds } }
    });
    
    if (produits.length !== produitIds.length) {
      throw new BadRequestException('Un ou plusieurs produits sont introuvables');
    }

    // Créer la commande avec ses plats en une seule transaction
    const commande = await  this.prisma.commande.create({
      data: {
        tableId,
        serveurId: Number(serveurId),
        plats: {
          create: plats.map(plat => ({
            produitId: plat.produitId,
            quantite: plat.quantite,
            etatPreparation: EtatPreparation.COMMANDE
          }))
        }
      },
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
        serveur: true,
        facture: true
      }
    });
    

    const cuisiniers = await this.prisma.cuisinier.findFirstOrThrow();
    const cuisinierId = cuisiniers.id;
   this.notificationGateway.sendToUser(cuisinierId, {
      message: `Nouvelle commande #${commande.id} à préparer ! 🍽️`,
      plats: commande.plats.map(p => p.produit.nom).join(', '),
      date: new Date().toISOString(),
});

    console.log(`Notification envoyée au cuisinier #${cuisinierId} : Nouvelle commande #${commande.id} à préparer !`);
    return commande;
  }

  // Récupérer toutes les commandes
  async findAll(): Promise<Commande[]> {
    return this.prisma.commande.findMany({
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
        serveur: true,
        facture: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Récupérer une commande par ID
  async findOne(id: number): Promise<Commande> {
    const commande = await this.prisma.commande.findUnique({
      where: { id },
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
        serveur: true,
        facture: true
      }
    });

    if (!commande) {
      throw new NotFoundException(`Commande avec ID ${id} introuvable`);
    }

    return commande;
  }

  // Récupérer les commandes d'un serveur
  async findByServeur(serveurId: number): Promise<Commande[]> {
    return this.prisma.commande.findMany({
      where: { serveurId },
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
        serveur: true,
        facture: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Récupérer les commandes d'une table
  async findByTable(tableId: number): Promise<Commande[]> {
    return this.prisma.commande.findMany({
      where: { tableId },
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
        serveur: true,
        facture: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Mettre à jour l'état de préparation d'un plat
  async updatePlatPreparation(
    commandeId: number, 
    platId: number, 
    updateDto: UpdatePlatCommandeDto
  ): Promise<PlatCommande> {
    const plat = await this.prisma.platCommande.findFirst({
      where: {
        id: platId,
        commandeId: commandeId
      }
    });

    if (!plat) {
      throw new NotFoundException(`Plat avec ID ${platId} introuvable dans la commande ${commandeId}`);
    }

    const updatedPlat= await this.prisma.platCommande.update({
      where: { id: platId },
      data: updateDto,
      include: {
        produit: true,
        commande: true
      }
    });
    const server = await this.prisma.serveur.findUnique({
      where: { id: updatedPlat.commande.serveurId }
    });
     if (updateDto.etatPreparation === 'PREPARE') {
    const serveurId = updatedPlat.commande.serveurId;
    const serveurNom = server?.nom || 'Serveur';
    const produitNom = updatedPlat.produit.nom;
    this.notificationGateway.sendToUser(serveurId, `${produitNom} est prêt !`);
    console.log(`Notification envoyée au serveur #${serveurId} : ${produitNom} est prêt`);
  }

  return updatedPlat;


  }

  // Calculer le montant total d'une commande avec gestion des formules
  async calculateTotal(commandeId: number): Promise<number> {
    const commande = await this.prisma.commande.findUnique({
      where: { id: commandeId },
      include: {
        plats: {
          include: {
            produit: true
          }
        }
      }
    });

    if (!commande) {
      throw new NotFoundException(`Commande avec ID ${commandeId} introuvable`);
    }
    
    let total = 0;
    for (const platCommande of commande.plats) {
      if (platCommande.produit.type === 'FORMULE') {
        total += platCommande.produit.prix * platCommande.quantite;
      } else {
        total += platCommande.produit.prix * platCommande.quantite;
      }
    }
    
    return total;
  }

  // Ajouter des plats à une commande existante
  async addPlats(commandeId: number, plats: CreatePlatCommandeDto[]): Promise<Commande> {
    const commande = await this.prisma.commande.findUnique({
      where: { id: commandeId },
      include: { facture: true }
    });
    
    if (!commande) {
      throw new NotFoundException(`Commande avec ID ${commandeId} introuvable`);
    }
    
    if (commande.facture) {
      throw new BadRequestException('Impossible d\'ajouter des plats à une commande déjà facturée');
    }

    const produitIds = plats.map(plat => plat.produitId);
    const produits = await this.prisma.produit.findMany({
      where: { id: { in: produitIds } }
    });
    
    if (produits.length !== produitIds.length) {
      throw new BadRequestException('Un ou plusieurs produits sont introuvables');
    }

    for (const plat of plats) {
      const platExistant = await this.prisma.platCommande.findFirst({
        where: {
          commandeId: commandeId,
          produitId: plat.produitId
        }
      });

      if (platExistant) {
        await this.prisma.platCommande.update({
          where: { id: platExistant.id },
          data: { quantite: platExistant.quantite + plat.quantite }
        });
      } else {
        await this.prisma.platCommande.create({
          data: {
            commandeId: commandeId,
            produitId: plat.produitId,
            quantite: plat.quantite,
            etatPreparation: EtatPreparation.COMMANDE
          }
        });
      }
    }

    return this.findOne(commandeId);
  }

  // Supprimer un plat d'une commande
  async removePlat(commandeId: number, platId: number): Promise<Commande> {
    const commande = await this.prisma.commande.findUnique({
      where: { id: commandeId },
      include: { facture: true }
    });
    
    if (!commande) {
      throw new NotFoundException(`Commande avec ID ${commandeId} introuvable`);
    }

    if (commande.facture) {
      throw new BadRequestException('Impossible de supprimer des plats d\'une commande déjà facturée');
    }

    const plat = await this.prisma.platCommande.findFirst({
      where: {
        id: platId,
        commandeId: commandeId
      }
    });

    if (!plat) {
      throw new NotFoundException(`Plat avec ID ${platId} introuvable dans la commande ${commandeId}`);
    }

    if (plat.etatPreparation === EtatPreparation.PREPARE) {
      throw new BadRequestException('Impossible de supprimer un plat déjà préparé');
    }

    await this.prisma.platCommande.delete({
      where: { id: platId }
    });

    return this.findOne(commandeId);
  }

  // Modifier la quantité d'un plat dans une commande
  async updatePlatQuantite(commandeId: number, platId: number, nouvelleQuantite: number): Promise<Commande> {
    const commande = await this.prisma.commande.findUnique({
      where: { id: commandeId }
    });
    if (!commande) {
      throw new NotFoundException(`Commande avec ID ${commandeId} introuvable`);
    }

    const plat = await this.prisma.platCommande.findFirst({
      where: {
        id: platId,
        commandeId: commandeId
      }
    });

    if (!plat) {
      throw new NotFoundException(`Plat avec ID ${platId} introuvable dans la commande ${commandeId}`);
    }

    if (plat.etatPreparation === EtatPreparation.PREPARE) {
      throw new BadRequestException('Impossible de modifier la quantité d\'un plat en cours de préparation ou prêt');
    }

    if (nouvelleQuantite <= 0) {
      throw new BadRequestException('La quantité doit être supérieure à zéro');
    }

    await this.prisma.platCommande.update({
      where: { id: platId },
      data: { quantite: nouvelleQuantite }
    });

    return this.findOne(commandeId);
  }
}
