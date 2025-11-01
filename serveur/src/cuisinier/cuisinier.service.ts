import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCuisinierDto } from "./dto/create-cuisinier.dto";
import {createTransport} from 'nodemailer';

@Injectable()
export class CuisinierService {
    constructor(private readonly prisma: PrismaService) {}
async create(createCuisinierDto: CreateCuisinierDto) {
  function generateUniqueNumericCode(length = 8) {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
  }

  const codeUnique = generateUniqueNumericCode(8);

  // Créer le cuisinier dans la base avec le codeUnique
  const newCuisinier = await this.prisma.cuisinier.create({
    data: {
      ...createCuisinierDto,
      codeUnique,
    },
  });

  // Configurer le transporteur d’email (ici exemple SMTP Gmail)
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
    to: createCuisinierDto.email,  // email du cuisinier
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

  return newCuisinier;
}

async findAll() { 
  return this.prisma.cuisinier.findMany();
}

async update(id: number, updateCuisinierDto: any) {
  const { nom, email } = updateCuisinierDto;

    function generateUniqueNumericCode(length = 8) {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
  };

  const codeUnique = generateUniqueNumericCode(8);
  const updatedCuisinier = await this.prisma.cuisinier.update({
    where: { id },
    data: {
      nom,
      email,
      codeUnique,
    },
  });

  // Si le code unique a été modifié, envoyer un nouvel email
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
      to: updatedCuisinier.email,
      subject: 'Votre code unique mis à jour',
      text: `Bonjour,\n\n votre information sont mise a jour \n\n Votre nouveau  code unique est  : ${codeUnique}\n\nMerci.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erreur envoi email:', error);
      } else {
        console.log('Email envoyé:', info.response);
      }
    });
  }

  return updatedCuisinier;
}
 async forgetCodeUnique(email: string) {
    const cuisinier = await this.prisma.cuisinier.findUnique({ where: { email } });
    if (!cuisinier) {
      throw new Error('cuisinier non trouvé avec cet email');
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
    to: cuisinier.email,
    subject: 'Récupération de votre code unique',
    text: `Bonjour ${cuisinier.nom},\n\nVotre code unique est : ${cuisinier.codeUnique}\n\nConservez-le précieusement.\n\nL'équipe Restaurant.`,
  };
  
   await transporter.sendMail(mailOptions);
  return { message: 'Votre code unique a été renvoyé à votre adresse email.' };
  }





}