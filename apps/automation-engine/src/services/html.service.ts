import { Injectable } from '@nestjs/common';
import { convert } from 'html-to-text';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { ExpressionService } from './expression.service';

@Injectable()
export class HtmlService {
	private turnDownService;

	constructor(private expressionService: ExpressionService) {
		this.turnDownService = new TurndownService({
			headingStyle: 'atx',
			hr: '---',
			bulletListMarker: '-',
			codeBlockStyle: 'fenced',
		});

		this.turnDownService.remove('script');
		this.turnDownService.remove('style');
		this.turnDownService.addRule('formatLink', {
			filter: ['a'],
			replacement: function (content, node) {
				return `[${content}]`;
			},
		});

		this.turnDownService.addRule('removeImage', {
			filter: ['img'],
			replacement: function (content, node) {
				return '';
			},
		});
	}

	async clean(expression: string, context: any, outputKey: string) {
		const items = await this.expressionService.evaluate(expression, context, outputKey);
		const source = convert(items[outputKey]);

		return { [outputKey]: source };
	}

	async md(expression: string, context: any, outputKey: string) {
		const items = await this.expressionService.evaluate(expression, context, outputKey);

		const output = this.turnDownService.turndown(items[outputKey]);
		return { [outputKey]: output };
	}

	async mdReadability(expression: string, context: any, outputKey: string) {
		const items = await this.expressionService.evaluate(expression, context, outputKey);

		const doc = new JSDOM(items[outputKey]);

		let source = new Readability(doc.window.document, {
			keepClasses: false,
			debug: false,
		}).parse();

		if (!source) {
			throw new Error('Failed to parse article');
		}

		let output = this.turnDownService.turndown(source.content);
		return { [outputKey]: output };
	}
}
