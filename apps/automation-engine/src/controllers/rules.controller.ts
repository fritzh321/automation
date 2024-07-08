import { Body, Controller, Param, Post } from '@nestjs/common';
import { RulesService } from '../services/rules.service';
import { AutomationService } from '../services/automation.service';

@Controller('/rules')
export class RulesController {
	constructor(
		private rulesService: RulesService,
		private automationService: AutomationService,
	) {}

	@Post('/simulate')
	async generateRulesOutput(@Body() body: { content: any; context: any }) {
		return this.rulesService.run(body.content, body.context);
	}

	@Post('/run/:id')
	async runAutomation(@Param() params: { id: string }, @Body() body: { context: any; meta?: any; recordPayload?: any }) {
		return await this.automationService.runById(params.id, body.context, body?.meta, body?.recordPayload);
	}
}
