import { forwardRef, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as config from '../../config';
import { AuthProvider, AuthProviderCallback, Client, Options } from '@microsoft/microsoft-graph-client';
import { RuleNode } from '../types/node';
import { ExpressionService } from './expression.service';
import { RulesService } from './rules.service';
import { SupabaseService } from '@franz/sdk/supabase.service';

@Injectable()
constructor(
		private expressionService: ExpressionService,
		private supbaseService: SupabaseService,
		@Inject(forwardRef(() => RulesService)) private rulesService: RulesService,
	) {}

	private microsoftGraphApiUrl = config.microsoftGraphApiUrl;
	private outlookClientId = config.outlookClientId;
	constructor(
		private expressionService: ExpressionService,
		private supbaseService: SupabaseService,
		@Inject(forwardRef(() => RulesService)) private rulesService: RulesService,
	) {}

	getAccessToken(refreshToken: string, done: Function) {
		axios
			.post(
				'https://login.microsoftonline.com/common/oauth2/v2.0/token',
				new URLSearchParams({
					client_id: 'e016066d-ea1e-4682-9000-84491beb838f',
					grant_type: 'refresh_token',
					scope: 'Mail.ReadWrite Mail.ReadWrite.Shared Mail.Send Mail.Send.Shared offline_access',
					state: '123456',
					refresh_token: refreshToken,
				}).toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			)
			.then((token) => {
				done(null, token.data.access_token);
			})
			.catch((err) => {
				done(err, null);
			});
	}

	private client(refreshToken: string) {
		const authProvider: AuthProvider = (callback: AuthProviderCallback) => {
			this.getAccessToken(refreshToken, callback);
		};
		let options: Options = {
			authProvider,
		};

		return Client.init(options);
	}

	async fetchMails(userId, folder, refreshToken, filter) {
		return this.client(refreshToken)
			.api(`users/${userId}/mailfolders('${folder?.length ? folder : 'Inbox'}')/messages`)
			.filter(filter)
			.select('id,body,subject,inferenceClassification,from,categories')
			.get();
	}
	async readMails(config, input) {
		const { data } = await this.supbaseService.supabase.from('account_credentials').select('*').eq('id', config.accountId).single();
		return this.fetchMails(data.account_id, config.folder, data.refresh_token, config.filter);
	}

	async updateMailCategory(input, node: RuleNode<{ categories: string; id: string; markAsRead: boolean; accountId: string }>) {
		let messageUpdate = {};
		const { data } = await this.supbaseService.supabase.from('account_credentials').select('*').eq('id', node.config.accountId).single();

		const { id } = await this.expressionService.evaluate(node.config.id, input, 'id');
		if (node.config.categories?.length) {
			const parseCategory: { categories: string | string[] } = await this.expressionService.evaluate(
				node.config.categories,
				input,
				'categories',
			);
			const categories = Array.isArray(parseCategory) ? parseCategory.categories : [parseCategory.categories];
			messageUpdate = { ...messageUpdate, categories: Array.isArray(categories) ? categories : [categories] };
		}

		try {
			console.log(messageUpdate);
			return this.client(data.refresh_token).api(`/users/${data?.account_id}/messages/${id}`).update(messageUpdate);
		} catch (e) {
			console.log(e);
			return input;
		}
	}

	async moveMail(input, node: RuleNode<{ categories: string; id: string; markAsRead: boolean; accountId: string; folderId: string }>) {
		try {
			let messageUpdate = {};
			const { data } = await this.supbaseService.supabase.from('account_credentials').select('*').eq('id', node.config.accountId).single();

			const { id } = await this.expressionService.evaluate(node.config.id, input, 'id');
			const { moveToFolder } = await this.expressionService.evaluate(node.config.folderId, input, 'moveToFolder');
			if (moveToFolder) {
				return this.client(data.refresh_token).api(`/users/${data?.account_id}/messages/${id}/move`).post({
					destinationId: moveToFolder,
				});
			}
			return {};
		} catch (error) {
			console.error('Error moving mail:', error);
		}
	}
}
