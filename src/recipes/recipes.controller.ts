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

@Controller('recipes')
export class RecipesController {
    constructor(
        private readonly recipesService: RecipesService,
        private readonly openaiService: OpenaiService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() recipeDto: CreateRecipePromptDto, @Req() request): Promise<Recipe> {
        const userId = request.user.id;

        const SYSTEM_MESSAGE: ChatCompletionMessageParam = {
            role: 'system',
            content:
                "You're an AI that users will request to help them create delicious recipes with a nice title, for every request you will send a JSON object following this format {title:'',description:'',ingredients:[{name:'',quantity:'',unit:''}],steps:[{order: '',content:'',}],duration:0,difficulty:'Facile'|'Normale'|'Difficile',season:'Été'|'Automne'|'Printemps|'Hiver'}. If any user ask about something other than recipes your response will always be {\"error\": \"wrong prompt\"}",
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
            authorId: userId,
        });

        return recipe;
    }

    @Get(':id')
    async findOneById(@Param('id') id: string): Promise<Recipe | null> {
        return this.recipesService.findOneById(id);
    }

    @Get('find')
    async findOne(@Query() params: Prisma.RecipeWhereUniqueInput): Promise<Recipe | null> {
        return this.recipesService.findOne(params);
    }

    @Patch(':id')
    async updateRecipe(
        @Param('id') id: string,
        @Body() updatedRecipe: Recipe,
    ): Promise<Recipe | null> {
        return this.recipesService.updateRecipe(id, updatedRecipe);
    }

    @Delete(':id')
    async deleteRecipe(@Param('id') id: string): Promise<Recipe | null> {
        return this.recipesService.delete(id);
    }
}
