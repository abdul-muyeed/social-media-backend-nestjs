import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRelationDto } from './dto/create-relation.dto';
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
      const newRelation = await queryRunner.manager.save(relation);
      await queryRunner.manager.save(senderUser);
      await queryRunner.manager.save(receiverUser);
      await queryRunner.commitTransaction();
      return newRelation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Something went wrong');
    } finally {
      await queryRunner.release();
    }
  }
  async remove(useId1: number, userId2: number) {
    if (useId1 === userId2) {
      throw new BadRequestException('You cannot remove yourself');
    }
    const relation =
      (await this.relationRepository.findOne({
        where: { sender: { id: useId1 }, receiver: { id: userId2 } },
      })) ||
      (await this.relationRepository.findOne({
        where: { sender: { id: userId2 }, receiver: { id: useId1 } },
      }));
    if (!relation) {
      throw new NotFoundException('Relation not found');
    }
    const user1 = await this.userRepository.findOne({
      where: { id: useId1 },
      relations: ['friendList'],
    });
    const user2 = await this.userRepository.findOne({
      where: { id: userId2 },
      relations: ['friendList'],
    });
    if (!user1 || !user2) {
      throw new NotFoundException('User not found');
    }
    user1.friendList = user1.friendList.filter((user) => user.id !== userId2);
    user2.friendList = user2.friendList.filter((user) => user.id !== useId1);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(user1);
      await queryRunner.manager.save(user2);
      await queryRunner.manager.remove(relation);
      await queryRunner.commitTransaction();
      return { message: 'Relation removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Something went wrong');
    } finally {
      await queryRunner.release();
    }
  }
}
