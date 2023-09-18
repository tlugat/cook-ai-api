import { Injectable } from '@nestjs/common';
import { Prisma, Recipe } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Injectable()
export class RecipesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: CreateRecipeDto): Promise<Recipe> {
        return this.prisma.recipe.create({
            data,
        });
    }

    async findOneById(id: string): Promise<Recipe | null> {
        return this.prisma.recipe.findUnique({
            where: {
                id,
            },
        });
    }

    async findOne(params: Prisma.RecipeWhereUniqueInput): Promise<Recipe | null> {
        return this.prisma.recipe.findUnique({
            where: params,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.RecipeWhereUniqueInput;
        where?: Prisma.RecipeWhereInput;
        orderBy?: Prisma.RecipeOrderByWithRelationInput;
    }): Promise<Recipe[]> {
        return this.prisma.recipe.findMany(params);
    }

    async update(id: string, data: Recipe): Promise<Recipe | null> {
        return this.prisma.recipe.update({
            where: {
                id,
            },
            data,
        });
    }

    async delete(id: string): Promise<Recipe | null> {
        return this.prisma.recipe.delete({
            where: {
                id,
            },
        });
    }
}
