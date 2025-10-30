import { Test, TestingModule } from '@nestjs/testing';
import { ServeurController } from './serveur.controller';

describe('ServeurController', () => {
  let controller: ServeurController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServeurController],
    }).compile();

    controller = module.get<ServeurController>(ServeurController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
