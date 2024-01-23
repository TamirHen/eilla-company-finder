import {Get, JsonController, Param, QueryParam, Req, Res} from 'routing-controllers'
import {CompanyService} from '@/services/CompanyService'
import {Inject} from 'typedi'
import {Request, Response} from 'express'
import {instanceToPlain} from 'class-transformer'
import _ from 'lodash'
@JsonController('/company')
export class CompanyController {

    @Inject()
    private companyService: CompanyService

    @Get('/options')
    async getSearchOptions(@Req() req: Request, @Res() res: Response) {
        const options = await this.companyService.getOptions()
        return res.status(200).send({
            options: _.sortBy(options, option => option.label.toLowerCase()),
        })

    }
    @Get('/:id')
    async getCompanyById(@Param('id') id: number, @Req() req: Request, @Res() res: Response) {
        const company = await this.companyService.getById(id)
        return res.status(200).send({
            company: instanceToPlain(company)
        })
    }

    @Get('/')
    async getCompaniesByName(@QueryParam('name') name: string, @Req() req: Request, @Res() res: Response) {
        if (!name) {
            return res.status(200).send({
                companies: [],
            })
        }
        const companies = await this.companyService.getByName(name)
        return res.status(200).send({
            companies: instanceToPlain(companies)
        })
    }


    @Get('/similar/:id')
    async getSimilarCompanies(@Param('id') companyId: number, @QueryParam('limit') limit: number | undefined, @QueryParam('offset') offset: number | undefined, @Req() req: Request, @Res() res: Response) {
        const similarCompanies = await this.companyService.getSimilarCompanies(companyId, limit, offset)
        const fullCount = similarCompanies.length ? similarCompanies[0].fullCount : 0
        let pageNumber: undefined | number
        let totalPages: undefined | number
        if (offset !== undefined && limit !== undefined) {
            pageNumber = Math.floor(offset / limit) + 1
        }
        if (limit) {
            totalPages = fullCount ? Math.ceil(fullCount/limit) : 1
        }

        return res.status(200).send({
            pageNumber,
            totalPages,
            companies: similarCompanies.map(({rank, ...company}) => ({
                rank,
                company: {
                    ...company,
                    keywords: company.keywords?.map(kw => kw.name) || [],
                },
            })),
        })
    }
}