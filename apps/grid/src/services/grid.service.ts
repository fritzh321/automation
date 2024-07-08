import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';

@Injectable()
export class GridService {
	constructor(private readonly rmqService: RMQService) {}
	async getHello() {
		return this.rmqService.notify('run', { id: 'test', payload: { test: 'test' } });
	}
}
