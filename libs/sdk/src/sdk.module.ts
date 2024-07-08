import { Module } from '@nestjs/common';
import { SdkService } from './sdk.service';
import { SupabaseService } from './supabase.service'; // Refactored import to be relative

@Module({
	providers: [SdkService, SupabaseService],
	exports: [SdkService, SupabaseService],
})
export class SdkModule {}
