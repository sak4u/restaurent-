import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // Admin : email + password
  async loginAdmin(email: string, password: string) {
    if (!email || !password) {
      throw new UnauthorizedException('Email et mot de passe requis');
    }

    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedException('Admin introuvable');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new UnauthorizedException('Mot de passe incorrect');

    const { password: _, ...adminSansMotDePasse } = admin;
    return { message: 'Connexion admin réussie', user: adminSansMotDePasse };
  }

  // Serveur : codeUnique uniquement
 async loginServeur(codeUnique: string) {
    const serveur = await this.prisma.serveur.findUnique({
      where: { codeUnique },
      include: {
        carres: {
          include: {
            tables: {
              include: {
                commandes: {
                  include: {
                    plats: {
                      include: { produit: true },
                    },
                    facture: true,
                  },
                },
              },
            },
          },
        },
        commandes: {
          include: {
            table: true,
            plats: {
              include: { produit: true },
            },
            facture: true,
          },
        },
      },
    });

    if (!serveur) {
      throw new NotFoundException('Code serveur invalide');
    }

    return { message: 'Connexion serveur réussie', user: serveur };
  }


  // Cuisinier : codeUnique uniquement
  async loginCuisinier(codeUnique: string) {
    if (!codeUnique) {
      throw new UnauthorizedException('Code unique requis');
    }

    const cuisinier = await this.prisma.cuisinier.findUnique({ where: { codeUnique } });
    if (!cuisinier) throw new UnauthorizedException('Code cuisinier invalide');

    return { message: 'Connexion cuisinier réussie', user: cuisinier };
  }
}
