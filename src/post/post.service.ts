import { CreateCommentDto } from './dto/create-comment.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { Relation } from 'src/relation/entities/relation.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Relation)
    private relationRepository: Repository<Relation>,
    private readonly dataSource: DataSource,
  ) {}
  create(createPostDto: CreatePostDto) {
    const post = this.postRepository.create(createPostDto);
    return this.postRepository.save(post);
  }
  async like(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['likes'],
    });
    const user = await this.UserRepository.findOne({ where: { id: userId } });

    console.log(post);
    if (!post || !user) {
      throw new NotFoundException('Post not found');
    }
    const isLiked = post.likes.some((like) => like.id === userId);
    if (isLiked) {
      post.likes = post.likes.filter((like) => like.id !== userId);
    } else {
      post.likes.push(user);
    }

    return this.postRepository.save(post);
  }
  async comment(CreateCommentDto: CreateCommentDto) {
    const { post: id, owner: userId, content } = CreateCommentDto;
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['comments'],
    });
    const owner = await this.UserRepository.findOne({ where: { id: userId } });

    if (!post || !owner) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({
      content,
      owner,
      post,
    });

    post.comments.push(comment);

    return this.postRepository.save(post);
  }

  async share(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['shares'],
    });
    const user = await this.UserRepository.findOne({ where: { id: userId }, relations: ['friendList'] });

    if (!post || !user) {
      throw new NotFoundException('Post not found');
    }
    const isfriend = user.friendList.some(
      (friend) => friend.id === post.owner.id,
    );

    if (!isfriend) {
      throw new UnauthorizedException(
        'You can only share post of your friends',
      );
    }

    const sharedPost = this.postRepository.create({
      owner: user,
      content: post.content,
    });
    post.shares.push(user);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(sharedPost);
      await queryRunner.manager.save(post);
      await queryRunner.commitTransaction();
      return {
        message: 'Post shared successfully',
        post: sharedPost,
        sharedPost: post,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Post sharing failed');
    } finally {
      await queryRunner.release();
    }
  }
  async findAllFromFriends(userId: number) {
    const user = await this.UserRepository.findOne({
      where: { id: userId },
      relations: ['friendList'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const friends = user.friendList.map((friend) => friend.id);
    friends.push(userId);
    return await this.postRepository.find({
      where: { owner: { id: In(friends) }, visiblity: true },
      relations: ['comments', 'likes', 'shares'],
    });
  }
  async findAll() {
    return await this.postRepository.find();
  }

  async findOne(id: number) {
    return await this.postRepository.find({
      where: { id },
      relations: ['comments', 'likes'],
    });
  }
}
