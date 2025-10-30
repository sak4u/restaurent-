import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {ProduitType} from '../enum/produit.enum'

export class CreateProduitDto{
    @IsNotEmpty()
    @IsString()
    nom: string;

    @IsNotEmpty()
    @IsNumber()
    prix: number;

    @IsNotEmpty()
    @IsEnum(ProduitType)
    type: ProduitType;

    photoUrl?: string;
}