import { Injectable } from '@nestjs/common';
import { evaluateExpression } from '@gorules/zen-engine';

@Injectable()
export class ExpressionService {
	constructor() {}

	async evaluate<T>(expression: string, context: any, outputKey: string): Promise<T | any> {
		const response = await evaluateExpression(expression, context);
		return { [outputKey]: response };
	}
}
