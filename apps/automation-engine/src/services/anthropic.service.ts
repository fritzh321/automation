import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AnthropicService {
	private anthropic: Anthropic;

	constructor(private configService: ConfigService) {
		const aiGateway = this.configService.get('AI_GATEWAY');
		if (!aiGateway) {
			throw new Error('AI_GATEWAY environment variable is not defined.');
		}
		this.anthropic = new Anthropic({
			baseURL: `https://gateway.ai.cloudflare.com/v1/dfc2aec27f30abf7a5ce95bec375d3f8/${aiGateway}/anthropic`,
		});
	}

	async generate(query: string, system: string, model: string): Promise<any> {
		try {
			const response = await this.anthropic.messages.create({
				model: model,
				system: system,
				messages: [
					{
						role: 'user',
						content: query,
					},
				],
				temperature: 0.2,
				max_tokens: 512,
				top_p: 0.75,
			});

			const data = JSON.parse(response.content?.[0].text);

			return data;
		} catch (e) {
			throw new HttpException(
				'An error occurred while generating text with Anthropic.',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
