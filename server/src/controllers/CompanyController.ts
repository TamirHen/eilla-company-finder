import {Get, JsonController, Param, QueryParam, Req, Res} from 'routing-controllers'
import {CompanyService} from '@/services/CompanyService'
import {Inject} from 'typedi'
import {Request, Response} from 'express'

@JsonController('/company')
export class CompanyController {

    @Inject()
    private companyService: CompanyService

    @Get('/options')
    async getSearchOptions(@Req() req: Request, @Res() res: Response) {
        const options = await this.companyService.getNames()
        return res.status(200).send({
            options: options.sort()
        })

    }

    @Get('/')
    async getCompaniesByName(@QueryParam('name') name: string, @Req() req: Request, @Res() res: Response) {
        if (!name) {
            return res.status(200).send({
                companies: []
            })
        }
        const companies = await this.companyService.getByName(name)
        return res.status(200).send({
            companies
        })
    }

    @Get('/similar/:id')
    async getSimilarCompanies(@Param('id') companyId: number, @QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @Req() req: Request, @Res() res: Response) {
        const similarCompanies = await this.companyService.getSimilarCompanies(companyId, limit, offset)
        return res.status(200).send({
            companies: similarCompanies.map(({rank, ...company}) => ({rank, company}))
        })
    }
}