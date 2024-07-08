import { Module } from '@nestjs/common';
import { SdkService } from './sdk.service';
import { SupabaseService } from '@franz/sdk/supabase.service';

@Module({
	providers: [SdkService, SupabaseService],
	exports: [SdkService, SupabaseService],
})
export class SdkModule {}
