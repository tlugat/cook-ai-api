import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
    providers: [RatingsService, PrismaService],
    controllers: [RatingsController],
})
export class RatingsModule {}
