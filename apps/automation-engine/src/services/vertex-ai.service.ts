import { Injectable } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import axios from 'axios';
import process from 'node:process';

const authKeys = {
	type: 'service_account',
	project_id: 'playground-415609',
	private_key_id: 'cdecc5de3907f94a6eda174489d6044f213369f5',
	private_key:
		'-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0rmZ4pwCEa8Pm\nOv5DsumO2EZPlncWKcDdSwJBT5qWyr7zySy1TvY9Z/DehcqrKxSXzS+CQFsa0a5/\nuxH3ynCRv+fEtJJHXkd7lDsKT2OZ3o4PPmy9YMV9lafxJhkugOBLCkiwSbd7vlnl\nb1lKbUm72dj4HF2EGale0t/JPWkIqjqNGHFfatc+dMTVfHSI0u9Dxs9T64PxqYFi\nxKhNfO+JqnEATicCmm1TmlqftT65rjC3I56di3LDxGmGdbUR6Vfvn4QZ5WdCZvHc\nuG8F8dMGr4ygyjLh4ZFSwJdNllGG3ebWmM9zangepG6g3SUERkziCEBE40bVckMO\nSlZnir7LAgMBAAECggEAMRSQ5GRlGROXBvLuf+BZXoK0cskqNzyHVfWaurgPg7e2\ncE2tFeFJtXuHLENGvwF4WhYUOjsWJG5iCvN7mYaF1qm9ISt18uoS2+hzs0TGhxU0\nHML10em4K/mbwb96Jq4+f1PfU/fqXjRighcht7yBQ4SVUiyOYKSB5C6/OJC0d/Qj\n/vwjGeF8R/W3cOKfJvnAYdVksUzGwGUCAK4aSI2lD/L1YiVS/GPR+RhSF4hChell\nV4RttGRFunGpxT9qsVOgp6wKQpxtLfp2lyaY3AN8c9aiRMBLxFANDYabl3di+hdZ\nQI3lmaT4NPJqIOJbCvGkp0oieKBBrtFPRH7Gv9VNaQKBgQD2bEqe1sS7zUvxcuj0\nB4LSr48u3isq7hx6d7d1DjnzjMqBV4Yz5aMnYbwJmMJ5StV13ss+h3M9WoZAEw6g\nG41Ol3zjORcWkl1CNooEkGhj/TQQnTzoIikWEvceo+e3UDm3rI3yWOVoduvdUxqk\nvkVsqYvj6qjyXom4WInPof6KMwKBgQC7tAgf+EeSG0oRB9oSQJNXFwkQYHKlBivn\n7TMp9mu4oWkSz0mnx8nrsJ9Dw4IcPEQfjoOvSWjxhR65YatflXg6kA5pPzcTlqBW\nVVO5gSEdT5G6j7SoMEhgeszbLAXPjJfXXH/t12Dnn1fGU2HwvgmupYSccpO9h+mv\nDuhOImuRCQKBgAmtqyid6tAtegQbrUaYXO0FdCw1EaD4BSpSNWRlkKUeLH30ABNd\nu5C6Z/ZAh7LX25Zrj7P/Aemw+oDdvr9PFbe2f3M1NNDwIrWNCtKvEUqMEVVtt4yu\nesqhKA+OBHXQstOh9VlFYI0/zne84dkCmBtydUoYV1ZdnC8fWxpKlIK9AoGBALW9\nf+xseefWsmVBA/2ONtspO6Z2rCpqilJ6kYJ8zRosds82k2t3f2PMVLjI8Q6jr5Ya\naBhtbMYFDZWTItpen9WcK8ft5Eb8HezZm0JO7CA0LbbEc7gxX7LC090Wh93IlDB6\nqIdCddpupw8pJvhxGHDYZEkSi0gE89eDCJy2qQ35AoGAMjW7oRdWrsFjL1VO7sf2\n3wh5eQ4tMjL+FIaEo0YmF2f+kMPHbiMXBwPX+4+991KWJTKU8SmRvUL87n6SEiug\nxgYHsxS0kWfBg1+0cXXuYgnc65YVrck/dG9DFEFoBYWHGU7jt7XBSP80HGCZcU/C\nYMKGBQo/1cNu1OpuEl2Cz64=\n-----END PRIVATE KEY-----\n',
	client_email: 'vertex@playground-415609.iam.gserviceaccount.com',
	client_id: '100978550513040833324',
	auth_uri: 'https://accounts.google.com/o/oauth2/auth',
	token_uri: 'https://oauth2.googleapis.com/token',
	auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
	client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/vertex%40playground-415609.iam.gserviceaccount.com',
	universe_domain: 'googleapis.com',
};

@Injectable()
export class VertexAiService {
	constructor() {}

	async token() {
		const client = new JWT({
			email: authKeys.client_email,
			key: authKeys.private_key,
			scopes: ['https://www.googleapis.com/auth/cloud-platform'],
		});

		const jwt = await client.authorize();
		return jwt?.access_token;
	}
	async generate(query: string, system: string, model: string) {
		try {
			const { data }: any = await axios.post(
				`https://gateway.ai.cloudflare.com/v1/dfc2aec27f30abf7a5ce95bec375d3f8/${process.env.AI_GATEWAY}/google-vertex-ai/v1/projects/playground-415609/locations/europe-central2/publishers/google/models/${model}:generateContent`,
				{
					generationConfig: {
						maxOutputTokens: 8192,
						temperature: 1,
						topP: 0.95,
					},
					contents: {
						role: 'user',
						parts: [
							{
								text: query,
							},
						],
					},
					systemInstruction: {
						parts: [
							{
								text: system,
							},
						],
					},
				},
				{
					headers: {
						Authorization: `Bearer ${await this.token()}`,
					},
				},
			);

			const response = data.candidates[0].content.parts[0].text;

			return response;
		} catch (e) {
			return e?.error?.message;
		}
	}
}
