import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class CreatePostDto {
  content: string;
  visibility: boolean;
  owner: User; // Assuming owner is a user ID
}
