import { Injectable } from '@nestjs/common';
import { ExpressionService } from './expression.service';
import { SupabaseService } from '@franz/sdk/supabase.service';

@Injectable()
export class StorageService {
	constructor(
		private supabaseService: SupabaseService,
		private expressionService: ExpressionService,
	) {}

	async getPublicUrl(expression: string, context: any, outputKey: string) {
		const items = await this.expressionService.evaluate(expression, context, outputKey);

		const { data } = this.supabaseService.supabase.storage.from('files').getPublicUrl(items[outputKey]);
		return { [outputKey]: data?.publicUrl };
	}
}
