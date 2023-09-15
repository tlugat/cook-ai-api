import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        const { password, ...result } = user;
        return result;
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll() {
        const users = await this.usersService.findAll();
        return users;
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Omit<User, 'password'>> {
        const user = await this.usersService.findOne(id);
        const { password, ...result } = user;
        return result;
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
        const user = await this.usersService.update(id, updateUserDto);
        return user;
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        const user = await this.usersService.remove(id);
        return user;
    }
}
