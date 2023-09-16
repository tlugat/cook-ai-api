import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { Rating } from '@prisma/client';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('ratings')
export class RatingsController {
    constructor(private readonly ratingsService: RatingsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() ratingDto: CreateRatingDto, @Req() request): Promise<Rating> {
        const userId = request.user.id;

        const rating = await this.ratingsService.create({
            rating: ratingDto.rating,
            recipe: {
                connect: {
                    id: ratingDto.recipeId,
                },
            },
            user: {
                connect: {
                    id: userId,
                },
            },
        });

        return rating;
    }

    @Get(':id')
    async findOneById(@Param('id') id: string): Promise<Rating | null> {
        return this.ratingsService.findOneById(id);
    }

    @Patch(':id')
    async updateRating(@Param('id') id: string, @Body() rating: Rating): Promise<Rating | null> {
        return this.ratingsService.updateRating(id, rating);
    }

    @Delete(':id')
    async deleteRating(@Param('id') id: string): Promise<HttpStatus> {
        await this.ratingsService.delete(id);
        return HttpStatus.NO_CONTENT;
    }

    @Get('/average/:recipeId')
    async getAverageRatingForRecipe(@Param('recipeId') recipeId: string): Promise<number> {
        const averageRating = await this.ratingsService.calculateAverageRatingForRecipe(recipeId);
        return averageRating;
    }
}
