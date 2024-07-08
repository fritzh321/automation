import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RulesController } from './controllers/rules.controller';
import { RulesService } from './services/rules.service';
import { ConfigModule } from '@nestjs/config';
import { NodeHandlerService } from './services/node-handler.service';
import { OutlookService } from './services/outlook.service';
import { ExpressionService } from './services/expression.service';
import { HtmlService } from './services/html.service';
import { ForLoopService } from './services/for-loop.service';
import { OpenAIService } from './services/openai.service';
import { LlmService } from './services/llm.service';
import { AutomationService } from './services/automation.service';
import { GroqService } from './services/groq.service';
import { TemplateService } from './services/template.service';
import { LlmController } from './controllers/llm.controller';
import { AnthropicService } from './services/anthropic.service';
import { RequestService } from './services/request.service';
import { VertexAiService } from './services/vertex-ai.service';
import { StorageService } from './services/storage.service';
import { ImageAiService } from './services/image-ai.service';
import { WorkerService } from './services/worker.service';
import { WorkerConsumerService } from './services/worker-consumer.service';
import { PdfAiService } from './services/pdf-ai.service';
import { RMQModule } from 'nestjs-rmq';
import { MessageController } from './controllers/message.controller';
import { SdkModule } from '@franz/sdk';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		RMQModule.forRoot({
			serviceName: 'automation',
			exchangeName: 'automation-exchange',
			prefetchCount: 5,
			queueName: 'automation-queue',
			connections: [
				{
					login: process.env.AMQP_LOGIN,
					password: process.env.AMQP_PASSWORD,
					host: process.env.AMQP_HOST,
				},
			],
		}),
		SdkModule,
	],
	controllers: [AppController, RulesController, LlmController, MessageController],
	providers: [
		AppService,
		RulesService,
		NodeHandlerService,
		OutlookService,
		ExpressionService,
		HtmlService,
		OpenAIService,
		LlmService,
		ForLoopService,
		AnthropicService,
		GroqService,
		AutomationService,
		VertexAiService,
		TemplateService,
		RequestService,
		ImageAiService,
		WorkerService,
		WorkerConsumerService,
		PdfAiService,
		StorageService,
	],
})
export class AppModule {}
