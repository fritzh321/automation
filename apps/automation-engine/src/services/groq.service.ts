import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import process from 'node:process';

@Injectable()
export class GroqService {
	private groq: Groq;

	constructor() {
		this.groq = new Groq({
			apiKey: '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',
			baseURL: `https://gateway.ai.cloudflare.com/v1/dfc2aec27f30abf7a5ce95bec375d3f8/${process.env.AI_GATEWAY}/groq`,
		});
	}

	async generate(query: string, system: string, model: string) {
		try {
			const response = await this.groq.chat.completions.create({
				model: model,
				messages: [
					{
						role: 'system',
						content: system,
					},
					{
						role: 'user',
						content: query,
					},
				],
				temperature: 0.2,
				max_tokens: 512,
				top_p: 0.75,
				frequency_penalty: 0.5,
				presence_penalty: 0.5,
				response_format: { type: 'json_object' },
			});

			const data = JSON.parse(response.choices[0].message.content as string);

			return data;
		} catch (e) {
			console.log(e);
			return e?.error?.message;
		}
	}
}
