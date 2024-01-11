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
        const recipesTitles = recipes
            .filter((recipe) => recipe.id !== recipeId)
            .map((recipe) => recipe.title);

        const recipe = recipes.find((recipe) => recipe.id === recipeId);
        const user = request.user;
        const userFoodPreferencesPrompt = `
        You should definitely consider the following food preferences if they are relevant: ${user.foodPreferences}
        `;
        const systemMessageContent =
            "I will send you a JSON object containing a recipe and a list of recipe titles. Your task is to analyze each recipe title and return only the three relevant ones based on the provided search string, sorted by a decimal heat index between 0 and 1. For every request, you should always respond with a JSON object in the following format: {results: [{title:'', indicator:decimal}]}. If there are no relevant results, please return an empty array in results.";

        const content = {
            recipe,
            recipes: recipesTitles,
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
        console.log(gptResponseJSON);
        if ('results' in gptResponseJSON === false) {
            return [];
        }

        const { results } = gptResponseJSON;

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
