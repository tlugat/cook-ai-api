import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Prisma, Comment } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Post()
    async create(@Body() commentDto: CreateCommentDto, @Req() request): Promise<Comment> {
        const userId = request.user.id;

        const comment = await this.commentsService.create({
            author: {
                connect: {
                    id: userId,
                },
            },
            recipe: {
                connect: {
                    id: commentDto.recipeId,
                },
            },
            content: commentDto.content,
        });

        return comment;
    }

    @Get(':id')
    async findOneById(@Param('id') id: string): Promise<Comment | null> {
        return this.commentsService.findOneById(id);
    }

    @Get('find')
    async findOne(@Query() params: Prisma.CommentWhereUniqueInput): Promise<Comment | null> {
        return this.commentsService.findOne(params);
    }

    @Get()
    async find(@Query() params: Prisma.CommentWhereUniqueInput): Promise<Comment[]> {
        return this.commentsService.findAll({ where: params });
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updatedComment: UpdateCommentDto,
    ): Promise<Comment | null> {
        return this.commentsService.update(id, updatedComment);
    }

    @Delete(':id')
    async deleteComment(@Param('id') id: string): Promise<Comment | null> {
        return this.commentsService.delete(id);
    }
}
