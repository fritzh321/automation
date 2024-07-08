import { RulesService } from './rules.service';
import { TemplateService } from './template.service';
import { WorkerService } from './worker.service';
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@franz/sdk/supabase.service';

@Injectable()
export class WorkerConsumerService {
	constructor(
		private rulesService: RulesService,
		private templateService: TemplateService,
		private workerService: WorkerService,
		private supabaseService: SupabaseService,
	) {}

	async runAutomationAsync(workerPayload) {
		let automationResponse;
		const { source, payload, id, meta, recordPayload } = workerPayload;

		const { data } = await this.supabaseService.supabase
			.from('automation_logs')
			.insert({
				automation_id: id,
				request: null,
				status: 3,
				performance: null,
				response: null,
			})
			.select('id')
			.single();

		try {
			console.log('runAutomationAsync', workerPayload.id);

			const { performance, trace, ...rest } = await this.rulesService.run(source, payload, false, true);

			if (meta?.template?.length > 0) {
				automationResponse = await this.templateService.render(null, rest, null, meta?.template);
			} else {
				automationResponse = rest;
			}

			if (automationResponse && recordPayload) {
				await this.workerService.sendToQueue({ ...recordPayload, data: automationResponse });
			}

			await this.supabaseService.supabase
				.from('automation_logs')
				.update({
					automation_id: id,
					request: workerPayload,
					status: 1,
					performance: performance,
					response: automationResponse,
				})
				.eq('id', data.id);

			return { automationId: id, payload, performance, automationResponse };
		} catch (e) {
			await this.supabaseService.supabase
				.from('automation_logs')
				.update({
					automation_id: id,
					request: workerPayload,
					status: 0,
					performance: 0,
					response: e.toString(),
				})
				.eq('id', data.id);
		}
	}
}
