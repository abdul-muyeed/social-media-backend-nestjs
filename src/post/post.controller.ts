import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from 'src/guard/auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Request() req: Request) {
    createPostDto.owner = req['id'];

    return this.postService.create(createPostDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/like')
  like(@Param('id') id: string, @Request() req: Request) {
    return this.postService.like(+id, req['id']);
  }
  @UseGuards(AuthGuard)
  @Patch(':id/comment')
  comment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: Request,
  ) {
    createCommentDto.owner = req['id'];
    createCommentDto.post = +id;
    return this.postService.comment(createCommentDto);
  }
  @UseGuards(AuthGuard)
  @Patch(':id/share')
  share(@Param('id') id: string, @Request() req: Request) {
    return this.postService.share(+id, req['id']);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
