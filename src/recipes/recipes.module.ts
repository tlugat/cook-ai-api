import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { OpenaiService } from 'src/openai/openai.service';
import { PrismaService } from 'src/prisma.service';

@Module({
    providers: [RecipesService, OpenaiService, PrismaService],
    controllers: [RecipesController],
})
export class RecipesModule {}
