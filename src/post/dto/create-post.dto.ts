import { User } from 'src/user/entities/user.entity';

export class CreatePostDto {
  content: string;
  visibility: boolean;
  owner: User; 
}
