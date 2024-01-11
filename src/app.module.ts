import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { OpenaiModule } from './openai/openai.module';
import { RecipesModule } from './recipes/recipes.module';
import { RatingsModule } from './ratings/ratings.module';
import { SidesModule } from './sides/sides.module';
import { FavoritesModule } from './favorites/favorites.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { CommentsModule } from './comments/comments.module';
@Module({
    imports: [
        AuthModule,
        UsersModule,
        OpenaiModule,
        RecipesModule,
        RatingsModule,
        CommentsModule,
        SidesModule,
        FavoritesModule,
        RecommendationsModule,
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
