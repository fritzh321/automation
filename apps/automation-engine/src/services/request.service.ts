import { Injectable } from '@nestjs/common';
import Mustache from 'mustache';
import axios from 'axios';

@Injectable()
export class RequestService {
	constructor() {}

	async run(context: unknown, outputKey: string, postBody: { body: string; method: string; url: string }) {
		let payload = context;
		let body = undefined;

		if (postBody?.body?.length) {
			body = JSON.parse(Mustache.render(postBody.body, payload));
		}

		const { data } = await axios({
			method: postBody.method,
			url: postBody.url,
			data: body,
		});

		return { [outputKey]: data };
	}
}
