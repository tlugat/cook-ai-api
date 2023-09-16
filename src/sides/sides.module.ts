import { Module } from '@nestjs/common';
import { SidesController } from './sides.controller';
import { OpenaiService } from 'src/openai/openai.service';
import { RecipesService } from 'src/recipes/recipes.service';
import { PrismaService } from 'src/prisma.service';

@Module({
    controllers: [SidesController],
    providers: [OpenaiService, RecipesService, PrismaService],
})
export class SidesModule {}
