import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecipePromptDto {
    @IsString()
    @IsNotEmpty()
    prompt: string;
}
