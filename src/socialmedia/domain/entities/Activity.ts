import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Activity {
  @PrimaryGeneratedColumn() id: number;

  @Column('bigint', { default: 0 })
  likes: number;

  static create(): Activity {
    return new Activity();
  }
}
