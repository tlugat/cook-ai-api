import { Injectable } from '@nestjs/common';
import { Prisma, Rating } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RatingsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.RatingCreateInput): Promise<Rating> {
        return this.prisma.rating.create({
            data,
        });
    }

    async findOneById(id: string): Promise<Rating | null> {
        return this.prisma.rating.findUnique({
            where: {
                id,
            },
        });
    }

    async findOne(params: Prisma.RatingWhereUniqueInput): Promise<Rating | null> {
        return this.prisma.rating.findUnique({
            where: params,
        });
    }

    async updateRating(id: string, data: Rating): Promise<Rating | null> {
        return this.prisma.rating.update({
            where: {
                id,
            },
            data,
        });
    }

    async delete(id: string): Promise<Rating | null> {
        return this.prisma.rating.delete({
            where: {
                id,
            },
        });
    }

    async calculateAverageRatingForRecipe(recipeId: string): Promise<number> {
        const ratings = await this.prisma.rating.findMany({
            where: {
                recipeId,
            },
            select: {
                rating: true,
            },
        });

        if (ratings.length === 0) {
            return 0;
        }

        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = totalRating / ratings.length;

        return averageRating;
    }
}
