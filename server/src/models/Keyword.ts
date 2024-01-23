import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'

@Entity()
export class Keyword {

    @PrimaryGeneratedColumn()
    readonly id: number

    @Index({unique: true})
    @Column()
    name: string

    @CreateDateColumn()
    readonly createdAt: Date

    @UpdateDateColumn()
    readonly updatedAt: Date

}