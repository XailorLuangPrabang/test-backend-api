import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

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

    @Column({ type: "varchar", length: 255, nullable: true })
    avatar: string | null;

    @Column({ nullable: true })
    bio?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ default: "user" })
    role: string;

    @Column({ default: 0 })
    followersCount: number;

    @Column({ default: 0 })
    followingCount: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    // // คนที่ follow user นี้
    // @OneToMany(() => Follow, follow => follow.following)
    // followers: Follow[];

    // // คนที่ user นี้ follow
    // @OneToMany(() => Follow, follow => follow.follower)
    // following: Follow[];
}
