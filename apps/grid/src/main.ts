import { NestFactory } from '@nestjs/core';
import { GridModule } from './grid.module';

async function bootstrap() {
	const app = await NestFactory.create(GridModule);
	await app.listen(3000);
}
bootstrap();
