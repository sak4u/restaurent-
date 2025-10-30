import { Controller, Post, Body ,Get,Put , Param} from '@nestjs/common';
import { ServeurService } from './serveur.service';
import { CreateServeurDto } from './dto/create.serveur';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('serveur')
@Controller('serveur')
export class ServeurController {
  constructor(private readonly serveurService: ServeurService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau serveur' })
  @ApiResponse({ status: 201, description: 'Serveur créé avec succès.' })
  async create(@Body() createServeurDto: CreateServeurDto) {
    return this.serveurService.create(createServeurDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les serveurs' })
  @ApiResponse({ status: 200, description: 'Liste de tous les serveurs.' })
  async findAll() {
    return this.serveurService.FindAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un serveur' })
  @ApiResponse({ status: 200, description: 'Serveur mis à jour avec succès.' })
  async update(@Param('id') id: string, @Body() updateServeurDto: CreateServeurDto) {
    return this.serveurService.update(Number(id), updateServeurDto);
  }

}
