import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { PrismaService } from 'src/prisma.service';

@Module({
    controllers: [FavoritesController],
    providers: [FavoritesService, PrismaService],
})
export class FavoritesModule {}
