import {Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'
import {Company} from '@/models/Company'

@Entity()
export class Industry {

    @PrimaryGeneratedColumn()
    readonly id: number

    @Index({unique: true})
    @Column()
    name: string

    @OneToMany(() => Company, (company) => company.industry)
    companies: Company[]

    @CreateDateColumn()
    readonly createdAt: Date

    @UpdateDateColumn()
    readonly updatedAt: Date

}