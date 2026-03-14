import { Module } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
    controllers: [CategoriesController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoriesModule { }
