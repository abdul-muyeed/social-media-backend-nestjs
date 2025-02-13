import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RelationService } from './relation.service';
import { CreateRelationDto } from './dto/create-relation.dto';
import { AuthGuard } from 'src/guard/auth.guard';

@Controller('friends')
export class RelationController {
  constructor(private readonly relationService: RelationService) {}
  @UseGuards(AuthGuard)
  @Post('request')
  create(@Body() createRelationDto: CreateRelationDto, @Request() req: Request) {
    createRelationDto.sender = req['id'];
    return this.relationService.create(createRelationDto);
  }
  @UseGuards(AuthGuard)
  @Patch('accept')
  acceptRequest(@Body() createRelationDto: CreateRelationDto, @Request() req: Request) {
    createRelationDto.sender = req['id'];
    return this.relationService.acceptRequest(createRelationDto);
  }
  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Request() req: Request) {
    console.log(req['id']);
    return this.relationService.remove(+id, +req['id']);
  }


}
