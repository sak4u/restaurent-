// produit.controller.ts
import { Controller, Post, Body,Get } from '@nestjs/common';
import { ProduitService } from './produit.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Produits') // Affiche le groupe dans Swagger UI
@Controller('produits')
export class ProduitController {
  constructor(private readonly produitService: ProduitService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un produit' })
  create(@Body() createProduitDto: CreateProduitDto) {
    return this.produitService.create(createProduitDto);
  }
  @Get('')
  @ApiOperation({ summary: 'Récupérer tous les produits' })   
  findAll() {
    return this.produitService.findAll();
  }
}
