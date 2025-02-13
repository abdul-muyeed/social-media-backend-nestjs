import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Comment } from 'src/post/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;
  @ManyToMany(() => User)
  @JoinTable()
  friendList: User[];
  @OneToMany(() => Comment, (comment) => comment.owner)
  comments: Comment[];
  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password) return;
    const salt = 10;
    this.password = await bcrypt.hash(this.password.toString(), salt);
  }

  async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password.toString(), this.password);
  }
}
