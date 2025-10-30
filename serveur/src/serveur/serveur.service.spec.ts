import { Test, TestingModule } from '@nestjs/testing';
import { ServeurService } from './serveur.service';

describe('ServeurService', () => {
  let service: ServeurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServeurService],
    }).compile();

    service = module.get<ServeurService>(ServeurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
