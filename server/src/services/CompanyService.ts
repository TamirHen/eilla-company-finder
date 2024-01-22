import {Inject, Service} from 'typedi'
import {CompanyRepository} from '@/repositories/CompanyRepository'
import {Company} from '@/models/Company'

@Service()
export class CompanyService {

    @Inject()
    private companyRepository: CompanyRepository

    async getOptions(query?: string) {
        return await this.companyRepository.findOptions(query)
    }

    async getByName(name: string) {
        return await this.companyRepository.findByName(name)
    }

    async getSimilarCompanies(companyId: number, limit?: number, offset?: number): Promise<(Company & {rank: number})[]> {
        return await this.companyRepository.findSimilar(companyId, limit, offset)
    }
}