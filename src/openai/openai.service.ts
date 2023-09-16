import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

@Injectable()
export class OpenaiService {
    private readonly openAI: OpenAI;
    constructor() {
        this.openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async complete(params: Omit<ChatCompletionCreateParamsNonStreaming, 'model'>): Promise<string> {
        const completionParams: ChatCompletionCreateParamsNonStreaming = {
            model: 'gpt-3.5-turbo',
            ...params,
        };
        const completion: OpenAI.Chat.ChatCompletion = await this.openAI.chat.completions.create(
            completionParams,
        );
        return completion.choices[0].message.content;
    }

    async generateImage(params: OpenAI.ImageGenerateParams): Promise<string> {
        const imageParams: OpenAI.ImageGenerateParams = {
            size: '1024x1024',
            n: 1,
            ...params,
        };
        const response = await this.openAI.images.generate(imageParams);
        return response.data[0].url;
    }
}
