import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRecipeDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    ingredients: string;

    @IsString()
    @IsNotEmpty()
    steps: string;

    @IsNumber()
    @IsNotEmpty()
    duration: number;

    @IsString()
    @IsNotEmpty()
    difficulty: string;

    @IsString()
    @IsNotEmpty()
    season: string;

    @IsString()
    @IsNotEmpty()
    authorId: string;
}
