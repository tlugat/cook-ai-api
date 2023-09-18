import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFavoriteDto {
    @IsString()
    @IsNotEmpty()
    recipeId: string;
}
