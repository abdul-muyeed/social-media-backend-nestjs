import { Comment } from 'src/post/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  content: string;
  @ManyToOne(() => User, (user) => user.posts)
  owner: User;
  @Column({ default: true })
  visiblity: boolean;
  @ManyToMany(() => User)
  @JoinTable()
  likes: User[];
  @OneToMany(() => Comment, (comment) => comment.post , {cascade: true})
  comments: Comment[];
  @ManyToMany(() => User)
  @JoinTable()
  shares: User[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
