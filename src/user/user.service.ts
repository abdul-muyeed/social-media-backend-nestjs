import { RegisterUserDto } from './dto/register-user.dto';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(registerUserDto: RegisterUserDto): Promise<{
    message: string;
    success: boolean;
    data: any;
  }> {
    const { email } = registerUserDto;
    const userExists = await this.userRepository.findOne({ where: { email } });
    const user = await this.userRepository.save(registerUserDto);
    return {
      message: 'User created successfully',
      success: true,
      data: user,
    };
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
