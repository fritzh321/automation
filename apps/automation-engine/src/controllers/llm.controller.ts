import { Body, Controller, Get, Post } from '@nestjs/common';
import { LlmService } from '../services/llm.service';

@Controller('/llm')
export class LlmController {
	constructor(private llmService: LlmService) {}

	@Get('')
	async getAll() {
		return this.llmService.getAllProviders();
	}
}
