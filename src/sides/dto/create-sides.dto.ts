import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSidesDto {
    @IsString()
    @IsNotEmpty()
    recipeId: string;
}
