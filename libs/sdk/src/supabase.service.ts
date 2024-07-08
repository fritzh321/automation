import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
	private readonly logger = new Logger(SupabaseService.name);
	public supabase: SupabaseClient;

	constructor(private readonly configService: ConfigService) {
		this.logger.log('getting supabase client...');

		this.logger.log('initialising new supabase client');

		this.supabase = createClient<any>(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_ANON_KEY'));
	}
}
