import { Module } from '@nestjs/common';
import { RelationService } from './relation.service';
import { RelationController } from './relation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Relation } from './entities/relation.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([User,Relation]),
  ],
  controllers: [RelationController],
  providers: [RelationService],
  exports: [TypeOrmModule],
})
export class RelationModule {}
