import { RMQRoute } from 'nestjs-rmq';
import { Controller } from '@nestjs/common';
import { WorkerConsumerService } from '../services/worker-consumer.service';

@Controller()
export class MessageController {
	public constructor(private readonly workerConsumerService: WorkerConsumerService) {}

	@RMQRoute('run')
	public async handleMessages(variantInfo) {
		console.log(variantInfo.id, 'triggered');
		await this.workerConsumerService.runAutomationAsync(variantInfo);
		console.log(variantInfo.id, 'done');
		return true;
	}
}
