import { TypeOrmModule } from '@nestjs/typeorm';
import { Module} from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { Relation } from 'src/relation/entities/relation.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Post,User,Comment,Relation]),
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [TypeOrmModule],
})
export class PostModule {}
