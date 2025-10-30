import {IsString,IsEmail, IsNotEmpty, MinLength} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCuisinierDto {

@ApiProperty()    
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

