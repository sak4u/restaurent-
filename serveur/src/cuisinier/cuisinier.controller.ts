import {CuisinierService}from './cuisinier.service' 
import {Controller, Post, Body,Get,Put, Param} from '@nestjs/common';
import {CreateCuisinierDto} from './dto/create-cuisinier.dto';
import {ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger';
@ApiTags('Cuisinier')
@Controller('cuisinier')
export class CuisinierController {
    constructor(private readonly cuisinierService: CuisinierService) {}

    @Post()
    @ApiOperation({ summary: 'Créer un cuisinier' })
    create(@Body() createCuisinierDto: CreateCuisinierDto) {
        return this.cuisinierService.create(createCuisinierDto);
    }
    @Get()
    @ApiOperation({ summary: 'Récupérer tous les cuisiniers' })
    findAll() {
        return this.cuisinierService.findAll();
    }
    @Put(':id')
    @ApiOperation({ summary: 'Mettre à jour un cuisinier' })
    update(@Param('id') id: string, @Body() updateCuisinierDto: CreateCuisinierDto) {
        return this.cuisinierService.update(Number(id), updateCuisinierDto);
    }

    @Post('forget-code')
    @ApiOperation({ summary:'forget code Unique cuisinier'})
    @ApiResponse({status:200, description:'Code unique envoyé avec succès'})
    async forgetPassword(@Body('email') email: string) {
      return this.cuisinierService.forgetCodeUnique(email);
    }
    

}