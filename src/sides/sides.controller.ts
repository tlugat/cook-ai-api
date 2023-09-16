import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OpenaiService } from 'src/openai/openai.service';
import { CreateSidesDto } from './dto/create-sides.dto';
import { RecipesService } from 'src/recipes/recipes.service';

@UseGuards(JwtAuthGuard)
@Controller('sides')
export class SidesController {
    constructor(
        private readonly openaiService: OpenaiService,
        private readonly recipesService: RecipesService,
    ) {}

    @Post()
    async create(@Body() recipeDto: CreateSidesDto): Promise<string[]> {
        const recipe = await this.recipesService.findOneById(recipeDto.recipeId);
        const SYSTEM_MESSAGE: ChatCompletionMessageParam = {
            role: 'system',
            content:
                'You\'re a chef for 15years and you\'re going to help users to get 3 to 5 accurate side recommendations for their meals like wine, desserts or cheese... etc. For every request you will send a JSON object following this format: {"sides": ["", "", ""]}}',
        };
        const messages: ChatCompletionMessageParam[] = [
            SYSTEM_MESSAGE,
            { role: 'user', content: recipe.title },
        ];
        const gptSides = await this.openaiService.complete({ messages });
        const gptSidesJSON = JSON.parse(gptSides);

        return gptSidesJSON.sides;
    }
}
