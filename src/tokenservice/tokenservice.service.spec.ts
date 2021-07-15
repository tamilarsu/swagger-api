import { Test, TestingModule } from '@nestjs/testing';
import { TokenserviceService } from './tokenservice.service';

describe('TokenserviceService', () => {
  let service: TokenserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenserviceService],
    }).compile();

    service = module.get<TokenserviceService>(TokenserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
