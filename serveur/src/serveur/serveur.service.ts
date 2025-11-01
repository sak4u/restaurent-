import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServeurDto } from './dto/create.serveur';
import {createTransport} from 'nodemailer';

@Injectable()
export class ServeurService {
    constructor(private readonly prisma: PrismaService) {}
    async create(createServeurDto: CreateServeurDto) {
  function generateUniqueNumericCode(length = 8) {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
  }

  const codeUnique = generateUniqueNumericCode(8);

  const serveur = await this.prisma.serveur.create({
    data: {
      ...createServeurDto,
      codeUnique,
    },
  });
  const transporter = createTransport({
      host : 'smtp.gmail.com',
      port: 587,
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASSWORD,   
      },
    });
  
    // Contenu du mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: createServeurDto.email,
      subject: 'Votre code unique',
      text: `Bonjour,\n\nVoici votre code unique : ${codeUnique}\n\nMerci.`,
    };
  
   
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erreur envoi email:', error);
      } else {
        console.log('Email envoyé:', info.response);
      }
    });
  
    return serveur;
  }

  async update(id: number, updateServeurDto: CreateServeurDto) {
    const { nom, email } = updateServeurDto;
    function generateUniqueNumericCode(length = 8) {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
  }

  const codeUnique = generateUniqueNumericCode(8);


    const updatedServeur = await this.prisma.serveur.update({
      where: { id },
      data: {
        nom,
        email,
        codeUnique,
      },
    });
    
    if (email) {
      const transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, 
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Mise à jour de vos informations',
        text: `Bonjour,\n\nVos informations ont été mises à jour.\n\n votre nouveau code unique est ${codeUnique} \n\nMerci.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Erreur envoi email:', error);
        } else {
          console.log('Email envoyé:', info.response);
        }
      });
    }
    return updatedServeur;
  }


    async FindAll(){
        return this.prisma.serveur.findMany({
            include: { carres: true },
        });
    }


    async findOne(id: number) {
        return this.prisma.serveur.findUnique({
            where: { id },
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
            },
        });
    }

   
    async remove(id: number) {
        return this.prisma.serveur.delete({
            where: { id },
        });
    }
  async findByCodeUnique(codeUnique: string) {
    return this.prisma.serveur.findUnique({
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
  }
  async findById(id: number) {
    return this.prisma.serveur.findUnique({
      where: { id },
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
      },
    });
  }



   async forgetCodeUnique(email: string) {
    const serveur = await this.prisma.serveur.findUnique({ where: { email } });
    if (!serveur) {
      throw new Error('Serveur non trouvé avec cet email');
    }

     const transporter = createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Prépare le mail
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: serveur.email,
    subject: 'Récupération de votre code unique',
    text: `Bonjour ${serveur.nom},\n\nVotre code unique est : ${serveur.codeUnique}\n\nConservez-le précieusement.\n\nL'équipe Restaurant.`,
  };
  
   await transporter.sendMail(mailOptions);
  return { message: 'Votre code unique a été renvoyé à votre adresse email.' };
  }
    
}
