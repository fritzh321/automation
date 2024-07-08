import { Injectable } from '@nestjs/common';
import { ExpressionService } from './expression.service';
import axios from 'axios';
import * as process from 'node:process';

@Injectable()
export class ImageAiService {
	constructor(private expressionService: ExpressionService) {}

	async ocr(node: { config: { language: string; service: string; input: string } }, input: unknown) {
		const items = await this.expressionService.evaluate(node.config.input, input, 'url');

		const form = new FormData();
		form.append('url', items['url']);

		const { data } = await axios.post(`${process.env.ONTOLOGY_URL}/image/ocr`, form, {
			params: {
				language: node.config.language,
				service: node.config.service,
			},
		});

		return data;
	}

	async detect(node: { config: { classes: string[]; input: string } }, input: unknown) {
		const items = await this.expressionService.evaluate(node.config.input, input, 'url');

		const form = new FormData();
		form.append('url', items['url']);

		const { data } = await axios.post(`${process.env.ONTOLOGY_URL}/image/detect`, form, {
			params: {
				class_names: node.config.classes.join(','),
			},
		});

		return data;
	}

	async question(node: { config: { prompt: string; questionType: string; input: string } }, input: unknown) {
		const items = await this.expressionService.evaluate(node.config.input, input, 'url');

		const form = new FormData();
		form.append('url', items['url']);

		const { data } = await axios.post(`${process.env.ONTOLOGY_URL}/image/question`, form, {
			params: {
				prompt: node.config.prompt,
				question_type: node.config.questionType,
			},
		});

		return { image_question: data };
	}
}
