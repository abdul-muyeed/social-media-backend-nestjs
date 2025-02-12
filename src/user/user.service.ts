import { RegisterUserDto } from './dto/register-user.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async create(registerUserDto: RegisterUserDto): Promise<{
    message: string;
    success: boolean;
    data: any;
  }> {
    const { email } = registerUserDto;
    const userExists = await this.userRepository.findOne({ where: { email } });
    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }
    const userRepo = this.userRepository.create(registerUserDto);
    const user = await this.userRepository.save(userRepo);
    return {
      message: 'User created successfully',
      success: true,
      data: user,
    };
  }

  async findOne(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const payload = { id: user.id, email: user.email, name: user.name };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
