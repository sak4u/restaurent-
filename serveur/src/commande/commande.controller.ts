import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Query
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery
} from '@nestjs/swagger';
import { CommandeService } from './commande.service';
import { CreateCommandeDto, CreatePlatCommandeDto } from './dto/create-commande.dto';
import { UpdatePlatCommandeDto } from './dto/update-commande.dto';

@ApiTags('commandes')
@Controller('commandes')
export class CommandeController {
  constructor(private readonly commandeService: CommandeService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle commande' })
  @ApiResponse({ 
    status: 201, 
    description: 'Commande créée avec succès' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données invalides' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Table ou serveur introuvable' 
  })
  @ApiBody({ type: CreateCommandeDto })
  create(@Body() createCommandeDto: CreateCommandeDto) {
    return this.commandeService.create(createCommandeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les commandes' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des commandes récupérée avec succès' 
  })
  findAll() {
    return this.commandeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une commande par ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la commande' })
  @ApiResponse({ 
    status: 200, 
    description: 'Commande récupérée avec succès' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Commande introuvable' 
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commandeService.findOne(id);
  }

  @Get('serveur/:serveurId')
  @ApiOperation({ summary: 'Récupérer les commandes d\'un serveur' })
  @ApiParam({ name: 'serveurId', type: 'number', description: 'ID du serveur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Commandes du serveur récupérées avec succès' 
  })
  findByServeur(@Param('serveurId', ParseIntPipe) serveurId: number) {
    return this.commandeService.findByServeur(serveurId);
  }

  @Get('table/:tableId')
  @ApiOperation({ summary: 'Récupérer les commandes d\'une table' })
  @ApiParam({ name: 'tableId', type: 'number', description: 'ID de la table' })
  @ApiResponse({ 
    status: 200, 
    description: 'Commandes de la table récupérées avec succès' 
  })
  findByTable(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.commandeService.findByTable(tableId);
  }

  @Post(':id/plats')
  @ApiOperation({ summary: 'Ajouter des plats à une commande existante' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la commande' })
  @ApiBody({ 
    type: [CreatePlatCommandeDto],
    description: 'Liste des plats à ajouter'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Plats ajoutés avec succès' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données invalides ou commande déjà facturée' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Commande ou produit introuvable' 
  })
  addPlats(
    @Param('id', ParseIntPipe) id: number,
    @Body() plats: CreatePlatCommandeDto[]
  ) {
    return this.commandeService.addPlats(id, plats);
  }

  @Delete(':id/plats/:platId')
  @ApiOperation({ summary: 'Supprimer un plat d\'une commande' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la commande' })
  @ApiParam({ name: 'platId', type: 'number', description: 'ID du plat à supprimer' })
  @ApiResponse({ 
    status: 200, 
    description: 'Plat supprimé avec succès' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Plat en cours de préparation ou commande facturée' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Commande ou plat introuvable' 
  })
  removePlat(
    @Param('id', ParseIntPipe) id: number,
    @Param('platId', ParseIntPipe) platId: number
  ) {
    return this.commandeService.removePlat(id, platId);
  }

  @Patch(':id/plats/:platId/quantite')
  @ApiOperation({ summary: 'Modifier la quantité d\'un plat dans une commande' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la commande' })
  @ApiParam({ name: 'platId', type: 'number', description: 'ID du plat' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        quantite: {
          type: 'number',
          minimum: 1,
          description: 'Nouvelle quantité'
        }
      },
      required: ['quantite']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Quantité modifiée avec succès' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Quantité invalide ou plat en cours de préparation' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Commande ou plat introuvable' 
  })
  updatePlatQuantite(
    @Param('id', ParseIntPipe) id: number,
    @Param('platId', ParseIntPipe) platId: number,
    @Body('quantite', ParseIntPipe) quantite: number
  ) {
    return this.commandeService.updatePlatQuantite(id, platId, quantite);
  }

  @Patch(':id/plats/:platId/preparation')
  @ApiOperation({ summary: 'Mettre à jour l\'état de préparation d\'un plat' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la commande' })
  @ApiParam({ name: 'platId', type: 'number', description: 'ID du plat' })
  @ApiBody({ type: UpdatePlatCommandeDto })
  @ApiResponse({ 
    status: 200, 
    description: 'État de préparation mis à jour avec succès' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Commande ou plat introuvable' 
  })
  updatePlatPreparation(
    @Param('id', ParseIntPipe) id: number,
    @Param('platId', ParseIntPipe) platId: number,
    @Body() updateDto: UpdatePlatCommandeDto
  ) {
    return this.commandeService.updatePlatPreparation(id, platId, updateDto);
  }

  @Get(':id/total')
  @ApiOperation({ summary: 'Calculer le montant total d\'une commande' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la commande' })
  @ApiResponse({ 
    status: 200, 
    description: 'Montant total calculé avec succès',
    schema: {
      type: 'object',
      properties: {
        commandeId: { type: 'number' },
        total: { type: 'number' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Commande introuvable' 
  })
  async calculateTotal(@Param('id', ParseIntPipe) id: number) {
    const total = await this.commandeService.calculateTotal(id);
    return {
      commandeId: id,
      total: total
    };
  }
}