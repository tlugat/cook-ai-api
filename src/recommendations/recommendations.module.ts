import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { OpenaiService } from 'src/openai/openai.service';
import { RecipesService } from 'src/recipes/recipes.service';
import { PrismaService } from 'src/prisma.service';

@Module({
    controllers: [RecommendationsController],
    providers: [OpenaiService, RecipesService, PrismaService],
})
export class RecommendationsModule {}
