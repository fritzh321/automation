import { BadRequestException, Injectable } from '@nestjs/common';
import { ZenEngine } from '@gorules/zen-engine';
import { NodeHandlerService } from './node-handler.service';

@Injectable()
export class RulesService {
	constructor(private nodeHandlerService: NodeHandlerService) {}
	async run(nodes: any, context: unknown, trace = true, async = false) {
		let contextObject = context;
		if (typeof context !== 'object') {
			contextObject = { $context: context };
		}
		try {
			const engine = new ZenEngine({
				customHandler: async (request) => {
					const { $nodes, ...rest } = request.input;
					const output = await this.nodeHandlerService.customNodeHandler(request.node, rest);
					return { output };
				},
			});

			const decision = engine.createDecision(nodes);
			return await decision.evaluate(contextObject, { trace: trace });
		} catch (e) {
			console.log(e);
			const errorString = e.toString();
			const jsonString = errorString.substring(errorString.indexOf('{'));
			const errorObject = JSON.parse(jsonString);

			throw async ? new Error(jsonString) : new BadRequestException(errorObject);
		}
	}
}
