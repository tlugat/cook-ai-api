import { Injectable } from '@nestjs/common';
import { Prisma, Comment } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.CommentCreateInput): Promise<Comment> {
        return this.prisma.comment.create({
            data,
        });
    }

    async findOneById(id: string): Promise<Comment | null> {
        return this.prisma.comment.findUnique({
            where: {
                id,
            },
        });
    }

    async findOne(params: Prisma.CommentWhereUniqueInput): Promise<Comment | null> {
        return this.prisma.comment.findUnique({
            where: params,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.CommentWhereUniqueInput;
        where?: Prisma.CommentWhereInput;
        orderBy?: Prisma.CommentOrderByWithRelationInput;
    }): Promise<Comment[]> {
        return this.prisma.comment.findMany(params);
    }

    async update(id: string, data: UpdateCommentDto): Promise<Comment | null> {
        return this.prisma.comment.update({
            where: {
                id,
            },
            data,
        });
    }

    async delete(id: string): Promise<Comment | null> {
        return this.prisma.comment.delete({
            where: {
                id,
            },
        });
    }
}
