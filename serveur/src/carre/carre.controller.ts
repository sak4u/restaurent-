import { Controller, Post, Body,Get, Param, Patch,Put } from '@nestjs/common';
import { CarreService } from './carre.service';
import { CreateCarreDto } from './dto/create.carre';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateCarreDto } from './dto/update.carre.dto';
import { get } from 'http';


@ApiTags('Carres') 
@Controller('carres')
export class CarreController {
  constructor(private readonly carreService: CarreService) {}

    @Post()
    @ApiOperation({ summary: 'Créer un carre avec génération automatique de tables' })
    @ApiResponse({ status: 201, description: 'Carre créé avec succès' })
    create(@Body() createCarreDto: CreateCarreDto) {
      return this.carreService.create(createCarreDto);
    }
    @Get()
    @ApiOperation({ summary: 'Récupérer tous les carres' })     
    @ApiResponse({ status: 200, description: 'Liste de tous les carres' })
    findAll() {
      return this.carreService.findAll();
    }

  @Get(':serveurId')
  @ApiOperation({ summary: 'Récupérer les carrés d\'un serveur' })
  @ApiResponse({ status: 200, description: 'Liste des carrés du serveur récupérée avec succès' })
  findByServeurId(@Param('serveurId') serveurId: string) {
    return this.carreService.findbyserveurId(Number(serveurId));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un carre' })
  @ApiResponse({ status: 200, description: 'Carre mis à jour avec succès'
  })
  update(@Param('id') id: string, @Body() updateCarreDto: UpdateCarreDto) {
    return this.carreService.update(Number(id), updateCarreDto);
  }
}

