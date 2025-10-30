// menu.controller.ts
import { Controller, Post,Get, Body, ParseIntPipe, Param } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AddProduitsToMenuDto } from './dto/add-produit.dto';


@ApiTags('Menus')
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un menu avec produits' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }
   
  @Post(':id/produits')
  @ApiOperation({ summary: 'Ajouter des produits à un menu existant' })
  addProduits(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddProduitsToMenuDto,
  ) {
    return this.menuService.addProduits(id, dto);
  }

    @Get('get-menu-with-products')
    @ApiOperation({ summary: 'Obtenir un menu avec ses produits' })
    getMenuWithProducts(@Body('menuId') menuId: number) {
        return this.menuService.getMenuWithProducts(menuId);
    }

    @Get()
    @ApiOperation({ summary: 'Récupérer tous les menus' })
    findAll() {
        return this.menuService.getAllMenus();
    }
}
