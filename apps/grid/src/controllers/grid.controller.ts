import { Controller, Get } from '@nestjs/common';
import { GridService } from '../services/grid.service';

@Controller()
export class GridController {
	constructor(private readonly gridService: GridService) {}

	@Get()
	getHello() {
		return this.gridService.getHello();
	}
}
