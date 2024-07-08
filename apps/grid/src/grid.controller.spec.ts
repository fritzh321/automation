import { Test, TestingModule } from '@nestjs/testing';
import { GridController } from './controllers/grid.controller';
import { GridService } from './services/grid.service';

describe('GridController', () => {
	let gridController: GridController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [GridController],
			providers: [GridService],
		}).compile();

		gridController = app.get<GridController>(GridController);
	});

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(gridController.getHello()).toBe('Hello World!');
		});
	});
});
