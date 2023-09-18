import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Prisma, Favorite } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Post()
    async create(@Body() favoriteDto: CreateFavoriteDto, @Req() request): Promise<Favorite> {
        const userId = request.user.id;

        const favorite = await this.favoritesService.create({
            user: {
                connect: {
                    id: userId,
                },
            },
            recipe: {
                connect: {
                    id: favoriteDto.recipeId,
                },
            },
        });

        return favorite;
    }

    @Get(':id')
    async findOneById(@Param('id') id: string): Promise<Favorite | null> {
        return this.favoritesService.findOneById(id);
    }

    @Get('find')
    async findOne(@Query() params: Prisma.FavoriteWhereUniqueInput): Promise<Favorite | null> {
        return this.favoritesService.findOne(params);
    }

    @Get()
    async find(@Req() request): Promise<Favorite[]> {
        const userId = request.user.id;
        return this.favoritesService.findAll({ where: { userId } });
    }

    @Delete(':id')
    async deleteFavorite(@Param('id') id: string): Promise<Favorite | null> {
        return this.favoritesService.delete(id);
    }
}
