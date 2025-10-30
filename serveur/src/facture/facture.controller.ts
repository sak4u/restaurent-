import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FactureService } from './facture.service';
import { CreateFactureDto } from './dto/create-facture.dto';
import { UpdateFactureDto } from './dto/update-facture.dot';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Factures')
@Controller('factures')
export class FactureController {
  constructor(private readonly factureService: FactureService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFactureDto: CreateFactureDto) {
    return this.factureService.create(createFactureDto);
  }

  @Get()
  findAll() {
    return this.factureService.findAll();
  }

  @Get('revenue/total')
  getTotalRevenue() {
    return this.factureService.getTotalRevenue();
  }

  @Get('revenue/period')
  getRevenueByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.factureService.getRevenueByPeriod(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('period')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.factureService.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.factureService.findOne(id);
  }

  @Get('commande/:commandeId')
  findByCommande(@Param('commandeId', ParseIntPipe) commandeId: number) {
    return this.factureService.findByCommande(commandeId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFactureDto: UpdateFactureDto
  ) {
    return this.factureService.update(id, updateFactureDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.factureService.remove(id);
  }
}
