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

	async customNodeHandler(node, input) {
		const inputSelector = node.config?.input?.length ? node.config.input : '$context';
		const outputSelector = node?.config?.outputKey?.length && node.config.outputKey;
		if (node.kind === 'outlook.read') {
			return this.outlookService.readMails(node.config, input);
		}

		if (node.kind === 'outlook.actions') {
			if (node.config?.categories) {
				return this.outlookService.updateMailCategory(input, node);
			}

			if (node.config?.folderId) {
				return this.outlookService.moveMail(input, node);
			}
		}

		if (node.kind === 'pdf.actions') {
			return this.pdfAiService.run(node, input);
		}

		if (node.kind === 'html.clean') {
			return this.htmlCleanService.clean(inputSelector, input, outputSelector);
		}

		if (node.kind === 'html.md') {
			return this.htmlCleanService.md(inputSelector, input, outputSelector);
		}

		if (node.kind === 'template') {
			return this.templateService.render(node.config?.input, input, 'template', node.config?.template);
		}

		if (node.kind === 'request') {
			return this.requestService.run(input, outputSelector, node.config);
		}

		if (node.kind === 'for.loop') {
			return this.forLoopService.run(node, input);
		}

		if (node.kind === 'llm') {
			return this.llmService.run(node, input);
		}

		if (node.kind === 'storage.path') {
			return this.storageService.getPublicUrl(inputSelector, input, outputSelector);
		}

		if (node.kind === 'image.detect') {
			return this.imageAiService.detect(node, input);
		}

		if (node.kind === 'image.question') {
			return this.imageAiService.question(node, input);
		}

		if (node.kind === 'image.ocr') {
			return this.imageAiService.ocr(node, input);
		}

		console.log('unkown node', node);

		return input;
	}
}
