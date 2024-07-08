import { Module } from '@nestjs/common';
import { GridController } from './controllers/grid.controller';
import { GridService } from './services/grid.service';
import { RMQModule } from 'nestjs-rmq';
import { ConfigModule } from '@nestjs/config';
import { GridEventsController } from './controllers/grid.events';
import { SdkModule } from '@franz/sdk';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		SdkModule,
		RMQModule.forRoot({
			serviceName: 'grid',
			exchangeName: 'grid-exchange',
			prefetchCount: 5,
			queueName: 'grid-queue',
			connections: [
				{
					login: process.env.AMQP_LOGIN,
					password: process.env.AMQP_PASSWORD,
					host: process.env.AMQP_HOST,
				},
			],
		}),
	],
	controllers: [GridController, GridEventsController],
	providers: [GridService],
})
export class GridModule {}
