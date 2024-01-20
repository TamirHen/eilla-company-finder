import {
    Column,
    CreateDateColumn,
    Entity,
    Index, JoinTable, ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import {Industry} from '@/models/Industry'
import {Keyword} from '@/models/Keyword'

@Entity()
export class Company {

    @PrimaryGeneratedColumn()
    readonly id: number

    @Index()
    @Column()
    name: string

    @ManyToOne(() => Industry, (industry) => industry.companies, {cascade: ['insert', 'update']})
    industry: Industry

    @Column({nullable: true})
    websiteUrl?: string

    @Column({nullable: true})
    linkedinUrl?: string

    @Column({nullable: true})
    tagline?: string

    @Column({nullable: true})
    about?: string

    @Column({nullable: true})
    yearFounded?: number

    @Column({nullable: true})
    locality?: string

    @Column({nullable: true})
    country?: string

    @Column({nullable: true})
    employeeCountEst?: number

    @ManyToMany(() => Keyword)
    @JoinTable()
    keywords: Keyword[]

    @CreateDateColumn()
    readonly createdAt: Date

    @UpdateDateColumn()
    readonly updatedAt: Date

}