import { Injectable } from '@nestjs/common';
import { OutlookService } from './outlook.service';
import { HtmlService } from './html.service';
import { ForLoopService } from './for-loop.service';
import { LlmService } from './llm.service';
import { TemplateService } from './template.service';
import { RequestService } from './request.service';
import { StorageService } from './storage.service';
import { ImageAiService } from './image-ai.service';
import { PdfAiService } from './pdf-ai.service';

@Injectable()
export class NodeHandlerService {
	constructor(
		private outlookService: OutlookService,
		private htmlCleanService: HtmlService,
		private forLoopService: ForLoopService,
		private templateService: TemplateService,
		private requestService: RequestService,
		private llmService: LlmService,
		private storageService: StorageService,
		private pdfAiService: PdfAiService,
		private imageAiService: ImageAiService,
	) {}

	private nodeHandlers = {
		'outlook.read': (node, input) => this.outlookService.readMails(node.config, input),
		'outlook.actions': (node, input) => {
			if (node.config?.categories) {
				return this.outlookService.updateMailCategory(input, node);
			}
			if (node.config?.folderId) {
				return this.outlookService.moveMail(input, node);
			}
		},
		'pdf.actions': (node, input) => this.pdfAiService.run(node, input),
		'html.clean': (node, input) => this.htmlCleanService.clean(node.config?.input, input, node.config?.outputKey),
		'html.md': (node, input) => this.htmlCleanService.md(node.config?.input, input, node.config?.outputKey),
		'template': (node, input) => this.templateService.render(node.config?.input, input, 'template', node.config?.template),
		'request': (node, input) => this.requestService.run(input, node.config?.outputKey, node.config),
		'for.loop': (node, input) => this.forLoopService.run(node, input),
		'llm': (node, input) => this.llmService.run(node, input),
		'storage.path': (node, input) => this.storageService.getPublicUrl(node.config?.input, input, node.config?.outputKey),
		'image.detect': (node, input) => this.imageAiService.detect(node, input),
		'image.question': (node, input) => this.imageAiService.question(node, input),
		'image.ocr': (node, input) => this.imageAiService.ocr(node, input)
	};

	async customNodeHandler(node, input) {
		const handler = this.nodeHandlers[node.kind];
		if (handler) {
			return handler(node, input);
		}
		console.warn('Unknown node kind:', node.kind);
		return input;
	}
}
