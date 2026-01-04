import { Entity, PrimaryColumn, Column } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class News {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Field(() => String)
  @Column({ name: 'title', type: 'text', nullable: false })
  title: string;

  @Field(() => String)
  @Column({ name: 'content', type: 'text', nullable: false })
  content: string;

  @Field(() => Date)
  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Field(() => String)
  @Column({ name: 'category', type: 'text', nullable: false })
  category: string;

  @Field(() => String)
  @Column({ name: 'image_url', type: 'text', nullable: false })
  imageUrl: string;
}
