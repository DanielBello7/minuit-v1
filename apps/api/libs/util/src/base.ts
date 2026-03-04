import { ICommon } from '@repo/types';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export abstract class CommonBase implements ICommon {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid', unique: true }) ref_id: string;
  @Column({ type: 'int', generated: 'increment', unique: true }) index: number;
  @CreateDateColumn({ type: 'timestamp' }) created_at: Date;
  @UpdateDateColumn({ type: 'timestamp' }) updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | undefined;

  @BeforeUpdate()
  update() {
    this.updated_at = new Date();
  }

  @BeforeInsert()
  insert() {
    const now = new Date();
    this.updated_at = now;
    this.created_at = now;
  }
}
