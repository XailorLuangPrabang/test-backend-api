// // src/entities/Follow.ts
// import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
// import { User } from "./user";

// @Entity()   // ต้องมี @Entity
// export class Follow {
//     @PrimaryGeneratedColumn()
//     id: number;

//     @ManyToOne(() => User, user => user.following)
//     follower: User;

//     @ManyToOne(() => User, user => user.followers)
//     following: User;
// }
