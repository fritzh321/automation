import { ExtendedMessage, RMQMessage, RMQRoute } from 'nestjs-rmq';
import { Controller } from '@nestjs/common';
import { SupabaseService } from '@franz/sdk/supabase.service';

@Controller()
export class GridEventsController {
	public constructor(private supabaseService: SupabaseService) {}

	@RMQRoute('run')
	public async handleMessages(variantInfo, @RMQMessage msg: ExtendedMessage) {
		console.log(variantInfo.id, 'triggered', msg.fields);
		const { data } = await this.supabaseService.supabase.from('automation_logs').select();
		console.log(data);
		return msg;
	}
}
