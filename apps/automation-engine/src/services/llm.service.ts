import { Injectable } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ExpressionService } from './expression.service';
import { GroqService } from './groq.service';
import { TemplateService } from './template.service';
import { llmProviders } from '../const/llm-providers';
import { AnthropicService } from './anthropic.service';
import { VertexAiService } from './vertex-ai.service';

@Injectable()
export class LlmService {
	constructor(
		private openAIService: OpenAIService,
		private groqService: GroqService,
		private anthropicService: AnthropicService,
		private vertexAiService: VertexAiService,
		private templateService: TemplateService,
	) {}

	getAllProviders() {
		return llmProviders;
	}

	async run(node: { config: { outputKey: string; input: string; prompt: string; model: string; user: string } }, input) {
		let llmResponse;
		const context = await this.templateService.render(null, input, 'template', node.config.prompt);
		const user = await this.templateService.render(null, input, 'template', node.config.user);

		const { group } = llmProviders.find((provider) => provider.name === node.config.model);

		if (group.toLowerCase() === 'anthropic') {
			llmResponse = await this.anthropicService.generate(user?.template, context?.template, node.config.model);
		}

		if (group.toLowerCase() === 'groq') {
			llmResponse = await this.groqService.generate(user?.template, context?.template, node.config.model);
		}

		if (group.toLowerCase() === 'openai') {
			llmResponse = await this.openAIService.generate(user?.template, context?.template, node.config);
		}

		if (group.toLowerCase() === 'google') {
			llmResponse = await this.vertexAiService.generate(user?.template, context?.template, node.config.model);
		}

		return { [node.config.outputKey]: llmResponse };
	}
}
