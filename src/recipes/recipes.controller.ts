import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { OpenaiService } from 'src/openai/openai.service';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { Prisma, Recipe } from '@prisma/client';
import { CreateRecipePromptDto } from './dto/create-recipe-prompt.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipesController {
    constructor(
        private readonly recipesService: RecipesService,
        private readonly openaiService: OpenaiService,
    ) {}

    @Post()
    async create(@Body() recipeDto: CreateRecipePromptDto, @Req() request): Promise<Recipe> {
        const user = request.user;
        const userFoodPreferencesPrompt = `
        You should definitely consider the following food preferences if they are relevant: ${user.foodPreferences}
        `;
        const systemMessageContent =
            "You're an AI that users will request to help them create delicious recipes with a nice title, for every request you will send a JSON object following this format {title:'',description:'',ingredients:[{name:'',quantity:'',unit:''}],steps:[{order: '',content:'',}],duration:0,difficulty:'Facile'|'Normale'|'Difficile',season:'Été'|'Automne'|'Printemps|'Hiver'}. If any user ask about something other than recipes or food your response will always be {\"error\": \"wrong prompt\"}.";
        const SYSTEM_MESSAGE: ChatCompletionMessageParam = {
            role: 'system',
            content: user.foodPreferences
                ? systemMessageContent + userFoodPreferencesPrompt
                : systemMessageContent,
        };
        const messages: ChatCompletionMessageParam[] = [
            SYSTEM_MESSAGE,
            { role: 'user', content: recipeDto.prompt },
        ];
        const gptRecipe = await this.openaiService.complete({ messages });
        const gptRecipeJSON = JSON.parse(gptRecipe);

        if (gptRecipeJSON.error) {
            throw new HttpException(gptRecipeJSON.error, HttpStatus.BAD_REQUEST);
        }

        const { title, description, ingredients, steps, duration, difficulty, season } =
            gptRecipeJSON;

        const recipe = await this.recipesService.create({
            title,
            description: description,
            ingredients: JSON.stringify(ingredients),
            steps: JSON.stringify(steps),
            duration,
            difficulty,
            season,
            authorId: user.id,
        });

        return recipe;
    }

    @Get('search')
    async IntelligentSearch(
        @Query()
        params: {
            skip?: number;
            take?: number;
            cursor?: Prisma.RecipeWhereUniqueInput;
            where?: Prisma.RecipeWhereInput;
            orderBy?: Prisma.RecipeOrderByWithRelationInput;
            search?: string;
        },
        @Req() request,
    ): Promise<Recipe[]> {
        const { search, ...p } = params;
        const recipes = await this.recipesService.findAll(p);
        const recipesTitles = recipes.map((recipe) => recipe.title);
        const user = request.user;
        const userFoodPreferencesPrompt = `
        You should definitely consider the following food preferences if they are relevant: ${user.foodPreferences}
        `;
        const systemMessageContent =
            "I will send you a JSON object containing a 'search' string and a list of recipe titles. Your task is to analyze each recipe title and return only the relevant ones based on the provided search string, sorted by a decimal heat index between 0 and 1. For every request, you should always respond with a JSON object in the following format: {results: [{title:'', indicator:decimal}]}. If there are no relevant results, please return an empty array in results.";

        const content = {
            search,
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

    @Get(':id')
    async findOneById(@Param('id') id: string): Promise<Recipe | null> {
        return this.recipesService.findOneById(id);
    }

    @Get('find')
    async findOne(@Query() params: Prisma.RecipeWhereUniqueInput): Promise<Recipe | null> {
        return this.recipesService.findOne(params);
    }

    @Get()
    async findAll(
        @Query()
        params: {
            skip?: number;
            take?: number;
            cursor?: Prisma.RecipeWhereUniqueInput;
            where?: Prisma.RecipeWhereInput;
            orderBy?: Prisma.RecipeOrderByWithRelationInput;
        },
    ): Promise<Recipe[]> {
        return this.recipesService.findAll(params);
    }

    @Patch(':id')
    async updateRecipe(
        @Param('id') id: string,
        @Body() updatedRecipe: Recipe,
    ): Promise<Recipe | null> {
        return this.recipesService.update(id, updatedRecipe);
    }

    @Delete(':id')
    async deleteRecipe(@Param('id') id: string): Promise<Recipe | null> {
        return this.recipesService.delete(id);
    }
}
