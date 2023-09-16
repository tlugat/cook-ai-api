import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { OpenaiModule } from './openai/openai.module';
import { RecipesModule } from './recipes/recipes.module';
import { RatingsModule } from './ratings/ratings.module';

@Module({
    imports: [AuthModule, UsersModule, OpenaiModule, RecipesModule, RatingsModule],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
