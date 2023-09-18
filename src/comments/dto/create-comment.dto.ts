import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    recipeId: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}
