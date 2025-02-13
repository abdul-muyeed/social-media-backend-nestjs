import { CreateCommentDto } from './dto/create-comment.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Not, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Comment } from './entities/comment.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
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
    const user = await this.UserRepository.findOne({ where: { id: userId } });

    if (!post || !user) {
      throw new NotFoundException('Post not found');
    }
    const sharedPost = this.postRepository.create({
      owner: user,
      content: post.content,
    })
    post.shares.push(user);
    const tnx =await this.postRepository.manager.transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save(sharedPost);
      await transactionalEntityManager.save(post);
    });

    return tnx ;
  }

  async findAll() {
    return await this.postRepository.find();
  }

  async findOne(id: number) {
    return await this.postRepository.find({ where: { id }, relations: ['comments', 'likes'], });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
