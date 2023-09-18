import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OpenaiService } from 'src/openai/openai.service';
import { CreateRecommendationsDto } from './dto/create-recommendations.dto';
import { RecipesService } from 'src/recipes/recipes.service';

@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
    constructor(
        private readonly openaiService: OpenaiService,
        private readonly recipesService: RecipesService,
    ) {}

    @Post()
    async create(@Body() recipeDto: CreateRecommendationsDto, @Req() request): Promise<string[]> {
        const { foodPreferences } = request.user;
        const userFoodPreferencesPrompt = `
        You should definitely consider the following food preferences if they are relevant: ${foodPreferences}
        `;
        const systemMessageContent =
            'You\'re a chef for 15years and you\'re going to help users to get 3 relevant and the most similar as possible recipes from a recipe title and description. For every request you will send a JSON object following this format: {"recommendations": ["", "", ""]}}. Each should be a recipe title only.';
        const recipe = await this.recipesService.findOneById(recipeDto.recipeId);
        const SYSTEM_MESSAGE: ChatCompletionMessageParam = {
            role: 'system',
            content: foodPreferences
                ? systemMessageContent + userFoodPreferencesPrompt
                : systemMessageContent,
        };
        const message = `title: ${recipe.title}\ndescription: ${recipe.description}`;
        const messages: ChatCompletionMessageParam[] = [
            SYSTEM_MESSAGE,
            { role: 'user', content: message },
        ];
        const gptRecommendations = await this.openaiService.complete({ messages });
        const gptRecommendationsJSON = JSON.parse(gptRecommendations);

        return gptRecommendationsJSON.recommendations;
    }
}
