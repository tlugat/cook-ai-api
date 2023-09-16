import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRatingDto {
    @IsNumber()
    @IsNotEmpty()
    rating: number;

    @IsString()
    @IsNotEmpty()
    recipeId: string;
}
