import { Injectable } from '@nestjs/common';
import { ExpressionService } from './expression.service';

import DocumentIntelligence, {
	AnalyzeResultOperationOutput,
	getLongRunningPoller,
	isUnexpected,
} from '@azure-rest/ai-document-intelligence';
import axios from 'axios';

@Injectable()
export class PdfAiService {
	constructor(private expressionService: ExpressionService) {}

	async run(node: { config: { input: string; azure: { output: string }; franz: { service: string }; service: string } }, input: unknown) {
		const item = await this.expressionService.evaluate(node.config.input, input, 'url');
		const url = item['url'];

		if (node.config.service === 'azure') {
			return this.azureDocument(url, node.config.azure);
		}
		if (node.config.service === 'franz') {
			return this.generate(url, node.config.franz);
		}
	}

	async azureDocument(url: string, config: { output: string }): Promise<{ markdown: string; meta: any }> {
		const key = '751843b30a4b440992f836bc21b03313';
		const endpoint = 'https://franzdocs.cognitiveservices.azure.com/';

		const client = DocumentIntelligence(endpoint, { key });

		const initialResponse = await client.path('/documentModels/{modelId}:analyze', 'prebuilt-layout').post({
			contentType: 'application/json',
			body: {
				urlSource: url,
			},
			queryParameters: { outputContentFormat: config.output },
		});

		if (isUnexpected(initialResponse)) {
			throw initialResponse.body.error;
		}

		const poller = getLongRunningPoller(client, initialResponse);
		const analyzeResult = ((await (await poller).pollUntilDone()).body as AnalyzeResultOperationOutput).analyzeResult;

		return {
			markdown: analyzeResult?.content ?? '',
			meta: analyzeResult?.apiVersion,
		};
	}

	async generate(url: string, config: { service: string }): Promise<{ markdown: string; meta: any }> {
		const pdfData = await axios.get(url, {
			responseType: 'arraybuffer',
		});

		// Create FormData with the PDF file
		const formData = new FormData();
		formData.append('file', new Blob([pdfData.data]), 'test');
		formData.append('service', config.service);

		// Send the FormData to the API endpoint
		const apiResponse = await fetch('http://ontology.franz.be/convert/markdown', {
			method: 'POST',
			body: formData,
		});

		if (!apiResponse.ok) {
			throw new Error(`Failed to send PDF to API: ${apiResponse.statusText}`);
		}

		const json: any = await apiResponse.json();
		return json;
	}
}
