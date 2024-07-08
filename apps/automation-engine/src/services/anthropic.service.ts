import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import process from 'node:process';

@Injectable()
export class AnthropicService {
	private anthropic: Anthropic;

	constructor() {
		this.anthropic = new Anthropic({
			baseURL: `https://gateway.ai.cloudflare.com/v1/dfc2aec27f30abf7a5ce95bec375d3f8/${process.env.AI_GATEWAY}/anthropic`,
		});
	}

	async generate(query: string, system: string, model: string) {
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

			const data = JSON.parse(response.content[0]['text']);

			return data;
		} catch (e) {
			console.log(e);
			return e?.error?.message;
		}
	}
}
