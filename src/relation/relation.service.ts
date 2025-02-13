import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';
import { User } from 'src/user/entities/user.entity';
import { Relation } from './entities/relation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';

@Injectable()
export class RelationService {
  constructor(
    @InjectRepository(Relation)
    private relationRepository: Repository<Relation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}
  async create(createRelationDto: CreateRelationDto) {
    const { sender, receiver } = createRelationDto;
    console.log(sender, receiver);
    const senderUser = await this.userRepository.findOne({
      where: { id: sender },
    });
    const receiverUser = await this.userRepository.findOne({
      where: { id: receiver },
    });
    const relationExists = await this.relationRepository.findOne({
      where: { sender: { id: sender }, receiver: { id: receiver } },
    });
    if (relationExists) {
      throw new ConflictException('Friend request already sent');
    }
    if (!senderUser || !receiverUser) {
      throw new NotFoundException('User not found');
    }
    console.log(senderUser, receiverUser);
    if (senderUser.id === receiverUser.id) {
      throw new BadRequestException(
        'You cannot send a friend request to yourself',
      );
    }
    const relation = this.relationRepository.create({
      sender: senderUser,
      receiver: receiverUser,
    });

    return this.relationRepository.save(relation);
  }
  async acceptRequest(createRelationDto: CreateRelationDto) {
    const { sender, receiver } = createRelationDto;
    const relation = await this.relationRepository.findOne({
      where: { sender: { id: receiver }, receiver: { id: sender } },
      relations: ['sender', 'receiver'],
    });
    if (!relation) {
      throw new NotFoundException('Friend request not found');
    }
    relation.status = 'accepted';
    const senderUser = await this.userRepository.findOne({
      where: { id: sender },
      relations: ['friendList'],
    });
    const receiverUser = await this.userRepository.findOne({
      where: { id: receiver },
      relations: ['friendList'],
    });
    if (!senderUser || !receiverUser) {
      throw new NotFoundException('User not found');
    }
    senderUser.friendList.push(receiverUser);
    receiverUser.friendList.push(senderUser);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newRelation = await this.relationRepository.save(relation);
      await this.userRepository.save(senderUser);
      await this.userRepository.save(receiverUser);
      await queryRunner.commitTransaction();
      return newRelation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Something went wrong');
    } finally {
      await queryRunner.release();
    }
  }
}
