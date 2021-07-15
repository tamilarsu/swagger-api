import { Test, TestingModule } from '@nestjs/testing';
import { IdconfigurationsService } from './idconfigurations.service';

describe('IdconfigurationsService', () => {
  let service: IdconfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdconfigurationsService],
    }).compile();

    service = module.get<IdconfigurationsService>(IdconfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
