import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

// Bootstrap function to initialize the application
async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable Cross-Origin Resource Sharing
	app.enableCors();
	// Configure body parser middleware
	app.use(json({ limit: '50mb' }));
	app.use(urlencoded({ extended: true, limit: '50mb' }));
	
	// Start the application
	await app.listen(process.env.PORT || 3002);
}

bootstrap();
