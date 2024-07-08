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
		private supabaseService: Supabase GUID ;
	) {}

	async runAutomationAsync(workerPayload) {
		const { source, payload, id, meta, recordPayload } = workerPayload;

		const logEntry = await this.createLogEntry(id);

		try {
			console.log('runAutomationAsync', id);

			const result = await this.rulesService.run(source, payload, false, true);
			const automationResponse = await this.handleAutomationResult(result, meta, recordPayload);

			await this.updateLogEntry(logEntry.id, workerPayload, 1, result.performance, automationResponse);

			return { automationId: id, payload, performance: result.performance, automationResponse };
		} catch (e) {
			await this.updateLogEntry(logEntry.id, workerPayload, 0, 0, e.toString());
			throw e;
		}
	}

	private async createLogEntry(automationId: string) {
		const { data } = await this.supabaseService.supabase
			.from('automation_logs')
			.insert({
				automation_id: automationId,
				request: null,
				status: 3,
				performance: null,
				response: null,
			})
			.select('id')
			.single();
		return data;
	}

	private async handleAutomationResult(result: any, meta: any, recordPayload: any) {
		let automationResponse;
		const { performance, ...rest } = result;

		if (meta?.template?.length > 0) {
			automationResponse = await this.templateService.render(null, rest, null, meta?.template);
		} else {
			automationResponse = rest;
		}

		if (automationResponse && recordPayload) {
			await this.workerService.sendToQueue({ ...recordPayload, data: automationResponse });
		}

		return automationResponse;
	}

	private async updateLogEntry(logId: string, requestPayload: any, status: number, performance: number, response: any) {
		await this.supabaseService.supabase
			.from('automation_logs')
			.update({
				automation_id: requestPayload.id,
				request: requestPayload,
				status,
				performance,
				response,
			})
			.eq('id', logId);
	}
}
