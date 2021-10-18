import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

export abstract class CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({
    nullable: true,
    default: false,
  })
  isDeleted: boolean;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  updatedBy: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  createdBy: string;
}
