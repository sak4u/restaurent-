import {IsString,IsEmail, IsNotEmpty, MinLength} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateServeurDto {

@ApiProperty({
    description: 'Nom du serveur',
})    
@IsNotEmpty()
@IsString()                           
    nom  :string;

@ApiProperty()    
@IsEmail()
@IsNotEmpty()
  email: string;
}
export class UpdateServeurDto {
    photoUrl?: string;
}

