import { Injectable } from '@nestjs/common';
import { evaluateExpression } from '@gorules/zen-engine';
import OpenAI from 'openai';
import process from 'node:process';

@Injectable()
export class OpenAIService {
	private _openai: OpenAI;

	constructor() {
		this._openai = new OpenAI({
			baseURL: `https://gateway.ai.cloudflare.com/v1/dfc2aec27f30abf7a5ce95bec375d3f8/${process.env.AI_GATEWAY}/openai`,
		});
	}

	async generate(query: string, system: string, config: { model: string; output?: string }) {
		try {
			const response = await this._openai.chat.completions.create({
				model: config.model,
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
				max_tokens: 4000,
				top_p: 0.75,
				frequency_penalty: 0.5,
				presence_penalty: 0.5,
				...(config.output == 'json' && { response_format: { type: 'json_object' } }),
			});

			let data = null;
			if (config?.output !== 'json') {
				return response.choices[0].message.content;
			} else {
				data = JSON.parse(response.choices[0].message.content as string);
			}

			return data;
		} catch (e) {
			return e?.error?.message;
		}
	}
}
