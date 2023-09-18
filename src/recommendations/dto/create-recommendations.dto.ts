import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecommendationsDto {
    @IsString()
    @IsNotEmpty()
    recipeId: string;
}
