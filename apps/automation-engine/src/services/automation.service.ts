import { Injectable } from '@nestjs/common';
import { ExpressionService } from './expression.service';
import { RMQService } from 'nestjs-rmq';
import { SupabaseService } from '@franz/sdk/supabase.service';

@Injectable()
export class AutomationService {
	constructor(
		private supabaseService: SupabaseService,
		private expressionEngine: ExpressionService,
		private readonly rmqService: RMQService,
	) {}

	public async runById(
		id: string,
		payload: any,
		meta?: { template: string; inputVariables: any[] },
		recordPayload?: {
			cellId: string;
			tableId: string;
		},
	) {
		const data = await this.supabaseService.supabase.from('automations').select().eq('id', id).single();
		const source = JSON.parse(data.data.source);
		let newObjects = [];

		if (meta?.inputVariables?.length) {
			newObjects = await Promise.all(
				meta.inputVariables.map(async (variable) => {
					return this.expressionEngine.evaluate(variable.name, payload, variable.input);
				}),
			);
		}

		payload = {
			...payload,
			...newObjects.reduce((acc, obj) => ({ ...acc, ...obj }), {}),
		};

		return this.rmqService.notify('run', { source, payload, id, meta, recordPayload });
	}
}
