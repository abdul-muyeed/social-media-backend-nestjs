import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Relation {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  sender: User;
  @ManyToOne(() => User)
  receiver: User;
  @Column({
    type: 'enum',
    enum: ['pending', 'accepted'],
    default: 'pending',
  })
  status: 'pending' | 'accepted';
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
