import { Injectable } from '@nestjs/common';
import { ExpressionService } from './expression.service';
import { Liquid } from 'liquidjs';

@Injectable()
export class TemplateService {
	constructor(private expressionService: ExpressionService) {}

	async render(expression: string, context: unknown, outputKey: string, template: string) {
		let payload = null;

		if (expression) {
			const result = await this.expressionService.evaluate(expression, context, outputKey);
			payload = result[outputKey];
		} else {
			payload = context;
		}

		const engine = new Liquid();
		const content = await engine.parseAndRender(template, payload);

		if (outputKey) {
			return { [outputKey]: content };
		}

		return content;
	}
}
