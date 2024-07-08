import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ExpressionService } from './expression.service';
import { RulesService } from './rules.service';
import { SupabaseService } from '@franz/sdk/supabase.service';

@Injectable()
export class ForLoopService {
	constructor(
		private supabaseService: SupabaseService,
		private expressionService: ExpressionService,
		@Inject(forwardRef(() => RulesService)) private rulesService: RulesService,
	) {}

	async run(node: { config: { outputKey: string; input: string; automationId: string } }, input) {
		const result = await this.expressionService.evaluate(node.config.input, input, node.config.outputKey);

		const data = await this.supabaseService.supabase.from('automations').select().eq('id', node.config.automationId).single();
		const source = JSON.parse(data.data.source);
		const output = result[node.config.outputKey];

		const concurrencyLimit = 5;
		const automationResult = [];

		for (let i = 0; i < output.length; i += concurrencyLimit) {
			const chunk = output.slice(i, i + concurrencyLimit);
			const results = await Promise.allSettled(chunk.map((item) => this.rulesService.run(source, item, false)));
			automationResult.push(...this.handleResults(results));
		}
		return { [node.config.outputKey]: automationResult };
	}

	private handleResults(results) {
		const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason);

		if (errors.length) {
			// Aggregate all errors into one
			throw new AggregateError(errors);
		}

		return results.map((result) => result.value);
	}
}
