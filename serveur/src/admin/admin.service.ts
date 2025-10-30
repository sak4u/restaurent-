import { Injectable , OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServeurDto } from '../serveur/dto/create.serveur';
import { CreateCuisinierDto } from './dto/create.cuisinier';


import * as bcrypt from 'bcrypt';
@Injectable()
export class AdminService implements OnModuleInit {
    constructor(private readonly prisma: PrismaService) {}
    async onModuleInit(){
        const isexist = await this.prisma.admin.findFirst();
        if (!isexist) {
            const hashedpassword = await bcrypt.hash('123',10);
            await this.prisma.admin.create({data:{
                nom : 'admin',
                email:'admin@gmail.com',
                password : hashedpassword
            }})
           console.log('Compte admin créé :)');
        }else{
            console.log('compte existe déja :(');
        }
}
}
