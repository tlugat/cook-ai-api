import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OpenaiService } from 'src/openai/openai.service';
import { CreateRecommendationsDto } from './dto/create-recommendations.dto';
import { RecipesService } from 'src/recipes/recipes.service';
import { Prisma, Recipe } from '@prisma/client';
import { getCurrentSeason } from 'src/utils/helpers';

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

    @Get()
    async Intelligent(
        @Query()
        params: {
            skip?: number;
            take?: number;
            cursor?: Prisma.RecipeWhereUniqueInput;
            where?: Prisma.RecipeWhereInput;
            orderBy?: Prisma.RecipeOrderByWithRelationInput;
            recipeId?: string;
        },
        @Req() request,
    ): Promise<Recipe[]> {
        console.log('in');
        const { recipeId, ...p } = params;
        const recipes = await this.recipesService.findAll(p);
        const recipesForGpt = recipes
            .filter((recipe) => recipe.id !== recipeId)
            .map((recipe) => ({ title: recipe.title, season: recipe.season }));

        const recipe = recipes.find((recipe) => recipe.id === recipeId);
        const currentSeason = getCurrentSeason();
        const user = request.user;
        const userFoodPreferencesPrompt = `
        You should definitely consider the following food preferences if they are relevant: ${user.foodPreferences}
        `;
        const systemMessageContent = `
        When you receive a JSON object containing a specific recipe, the current season, and a list of recipe objects (each with a title and its respective season), 
        your task is to conduct a thorough and nuanced analysis of this list. Focus on identifying and selecting the three recipes that are most closely related to the provided recipe and are appropriate for the current season. 
        Use advanced natural language processing and similarity comparison techniques to evaluate the connection between the given recipe and each recipe in the list, taking into account factors such as ingredients, cuisine style, and preparation methods.
        The response should be structured as a JSON object in the format: {results: [{title: string, indicator: decimal}]}, where 'indicator' is a decimal value ranging from 0 to 1. 
        This value should reflect the degree of relevance each recipe has to the provided recipe, as well as its suitability for the current season. 
        The 'heat index' calculation should intelligently assess similarities in ingredients, culinary techniques, and seasonal appropriateness.
        Return only the top three recipes that have the highest relevance scores, sorted by their 'heat index.' In the event that fewer than three recipes meet the criteria, return only those that qualify. 
        If no recipes are relevant, provide an empty array []. It's crucial to maintain the specified response format consistently for all requests to ensure predictable and reliable outcomes`;

        const content = {
            recipe,
            recipes: recipesForGpt,
            season: currentSeason,
        };
        const SYSTEM_MESSAGE: ChatCompletionMessageParam = {
            role: 'system',
            content: user.foodPreferences
                ? systemMessageContent + userFoodPreferencesPrompt
                : systemMessageContent,
        };
        const messages: ChatCompletionMessageParam[] = [
            SYSTEM_MESSAGE,
            { role: 'user', content: JSON.stringify(content) },
        ];
        const gptResponse = await this.openaiService.complete({ messages });
        const gptResponseJSON = JSON.parse(gptResponse);

        if (gptResponseJSON.error) {
            throw new HttpException(gptResponseJSON.error, HttpStatus.BAD_REQUEST);
        }

        if ('results' in gptResponseJSON === false) {
            return [];
        }

        const { results } = gptResponseJSON;
        console.log(results);
        const sortedRecipes = recipes
            .filter((recipe) => results.some((r) => r.title === recipe.title))
            .map((recipe) => {
                const indicator = results.find((r) => r.title === recipe.title).indicator;
                return { ...recipe, indicator };
            })
            .sort((a, b) => b.indicator - a.indicator);

        return sortedRecipes;
    }
}
