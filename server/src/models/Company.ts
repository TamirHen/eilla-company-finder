import {
    Column,
    CreateDateColumn,
    Entity,
    Index, JoinTable, ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import {Industry} from '@/models/Industry'
import {Keyword} from '@/models/Keyword'
import {Exclude, Transform, Type} from 'class-transformer'

@Entity()
export class Company {

    @PrimaryGeneratedColumn()
    readonly id: number

    @Index()
    @Column()
    name: string

    @Type(() => Industry)
    // transforms Industry to string on instanceToPlain()
    @Transform(params => params.value.name, {toPlainOnly: true})
    @ManyToOne(() => Industry, (industry) => industry.companies, {nullable: true, cascade: ['insert', 'update'], eager: true})
    industry?: Industry

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

    @Type(() => Keyword)
    // transforms Keyword[] to string[] on instanceToPlain()
    @Transform(params => {
        if (!params.value?.length) return []
        return params.value.map((kw: Keyword) => kw.name)
    }, {toPlainOnly: true})
    @ManyToMany(() => Keyword, {eager: true})
    @JoinTable()
    keywords: Keyword[]

    @Exclude()
    @CreateDateColumn()
    readonly createdAt: Date

    @Exclude()
    @UpdateDateColumn()
    readonly updatedAt: Date

}