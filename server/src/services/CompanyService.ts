import {Inject, Service} from 'typedi'
import {CompanyRepository} from '@/repositories/CompanyRepository'
import {Company} from '@/models/Company'
import {FindOneOptions} from 'typeorm/find-options/FindOneOptions'

@Service()
export class CompanyService {

    @Inject()
    private companyRepository: CompanyRepository

    async getOptions(query?: string) {
        return await this.companyRepository.findOptions(query)
    }

    async getById(id: number, options?: FindOneOptions<Company>) {
        return await this.companyRepository.findById(id)
    }

    async getByNameQuery(name: string, caseSensitive = false) {
        return await this.companyRepository.findByNameQuery(name, caseSensitive)
    }

    async getSimilarCompanies(companyId: number, limit?: number, offset?: number) {
        return await this.companyRepository.findSimilar(companyId, limit, offset)
    }
}