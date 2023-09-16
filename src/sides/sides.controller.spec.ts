import { Test, TestingModule } from '@nestjs/testing';
import { SidesController } from './sides.controller';

describe('SidesController', () => {
    let controller: SidesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SidesController],
        }).compile();

        controller = module.get<SidesController>(SidesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
