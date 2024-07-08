import { Injectable } from '@nestjs/common';
import axios from 'axios';
import process from 'node:process';

@Injectable()
export class WorkerService {
	constructor() {}

	async sendToQueue(payload: { cellId: string; data: unknown; tableId: string }) {
		const { data } = await axios.post(
			process.env.WORKER_URL,
			{
				action: 'cellCalculate',
				payload: [payload],
			},
			{
				headers: {
					Authorization: process.env.WORKER_TOKEN as string,
				},
			},
		);

		return data;
	}
}
