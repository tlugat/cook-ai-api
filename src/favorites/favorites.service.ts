import { Injectable } from '@nestjs/common';
import { Prisma, Favorite } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FavoritesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.FavoriteCreateInput): Promise<Favorite> {
        return this.prisma.favorite.create({
            data,
        });
    }

    async findOneById(id: string): Promise<Favorite | null> {
        return this.prisma.favorite.findUnique({
            where: {
                id,
            },
        });
    }

    async findOne(params: Prisma.FavoriteWhereUniqueInput): Promise<Favorite | null> {
        return this.prisma.favorite.findUnique({
            where: params,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.FavoriteWhereUniqueInput;
        where?: Prisma.FavoriteWhereInput;
        orderBy?: Prisma.FavoriteOrderByWithRelationInput;
    }): Promise<Favorite[]> {
        return this.prisma.favorite.findMany(params);
    }

    async delete(id: string): Promise<Favorite | null> {
        return this.prisma.favorite.delete({
            where: {
                id,
            },
        });
    }
}
