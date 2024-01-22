import {Service} from 'typedi'
import {Company} from '@/models/Company'
import {BaseRepository} from '@/repositories/BaseRepository'
import {Like} from 'typeorm'
import {instanceToInstance, plainToInstance} from 'class-transformer'
import {PlainObjectToNewEntityTransformer} from 'typeorm/query-builder/transformer/PlainObjectToNewEntityTransformer'
import dataSource from '@/data-source'
import {Keyword} from '@/models/Keyword'
import {FindOneOptions} from 'typeorm/find-options/FindOneOptions'

@Service()
export class CompanyRepository extends BaseRepository<Company> {
    protected constructor() {
        super(Company);
    }

    async findOptions(query?: string): Promise<{ id: number, label: string }[]> {
        const companyOptions = await this.find({
            select: {
                id: true,
                name: true,
            },
            where: {
                name: Like(`%${query || ''}%`),
            },
        })

        return companyOptions.map(({id, name}) => ({
            id,
            label: name
        }))
    }

    async findById(id: number, options?: FindOneOptions<Company>): Promise<Company | null> {
        return await this.findOne({
            ...options,
            where: {id},
        })
    }

    async findByName(name: string): Promise<Company[]> {
        return await this.find({
            where: {
                name,
            },
        })
    }

    /**
     * Scores and ranks the companies to get a sorted list from the most similar to the least by normalizing and weighting each relevant field:
     * Industry: either 1 or 0 (same industry, different industry)
     * Keywords: a number between 0-1 based on how many mutual keywords the companies have
     * Employee Count: a number between 0-1 based on how close the number of employees to the source company (relative to the rest)
     * Country: either 1 or 0 (same country, different country)
     * Year Founded: a number between 0-1 based on how close the year founded to the source company (relative to the rest)
     * Locality: either 1 or 0 (same locality, different locality)
     *
     * Every field gets weighted by how significant it is to find similarity, e.g. industry is more significant than year founded.
     * This generates a numerical value representing the distance between the source company and each target company (Euclidean distance similarity measure).
     *
     * @param companyId
     * @param limit
     * @param offset
     */
    async findSimilar(companyId: number, limit?: number, offset?: number): Promise<(Company & { rank: number })[]> {

        // ideally, all weights should sum up to 1 if you want "score" to be a number between 0-1
        const INDUSTRY_WEIGHT = 0.4
        const KEYWORDS_WEIGHT = 0.2
        const EMPLOYEES_COUNT_WEIGHT = 0.15
        const COUNTRY_WEIGHT = 0.2
        const YEAR_FOUNDED_WEIGHT = 0.025
        const LOCALITY_WEIGHT = 0.025

        let companies = await this.manager.query(`
            -- FIRST HELPER: calc difference of fields in source and target as numerical values
            WITH differences AS (
                SELECT s."name" source, 
                    s.id source_id, 
                    t."name" target, 
                    t.id target_id,
                     ABS(s.employee_count_est - t.employee_count_est) employee_diff,
                     ABS(s.year_founded - t.year_founded) year_founded_diff,
                     CASE WHEN s.industry_id = t.industry_id THEN 1 ELSE 0 END industry_diff,
                     CASE WHEN s.locality = t.locality THEN 1 ELSE 0 END locality_diff,
                     CASE WHEN s.country = t.country THEN 1 ELSE 0 END country_diff
                     
                FROM company t
                JOIN company s ON t.id != s.id
                AND s.id = ${companyId}
            ),
            -- SECOND HELPER calc min max attributes of numerical fields to use in normalization formula
            mins_maxs_attrs AS (
                SELECT
                    MIN(d.employee_diff) min_employee_diff,
                    MAX(d.employee_diff) max_employee_diff,
                    MIN(d.year_founded_diff) min_year_founded_diff,
                    MAX(d.year_founded_diff) max_year_founded_diff
                FROM differences d
            ),
            -- THIRD HELPER calc for each company how many common keywords it has with the source company
            target_common_keywords AS (
                SELECT
                    t.company_id AS target_id,
                    COUNT(*) AS common_keywords_count
                FROM
                    company_keywords_keyword s
                JOIN
                    company_keywords_keyword t ON s.keyword_id = t.keyword_id
                WHERE
                    s.company_id != t.company_id
                    AND s.company_id = ${companyId}
                GROUP BY
                    s.company_id, t.company_id
            ),
            -- FORTH HELPER: all metrics that's been taken into account to calc similarity are normalized into a number between 0-1
            normalized_metrics AS (
                SELECT 
                    d.source,
                    d.source_id,
                    d.target,
                    d.target_id,
                    -- normalize difference in number of employees to a number between 0-1, 1 being the closest and 0 the furthest
                    COALESCE(1 - (CAST((d.employee_diff - (SELECT min_employee_diff FROM mins_maxs_attrs)) AS DECIMAL) /
                    ((SELECT max_employee_diff FROM mins_maxs_attrs) - (SELECT min_employee_diff FROM mins_maxs_attrs))), 0.5) normalized_employee_count_diff,
                    -- normalize difference in year founded to a number between 0-1, 1 being the closest and 0 the furthest
                    COALESCE(1 - ((CAST((d.year_founded_diff - (SELECT min_year_founded_diff FROM mins_maxs_attrs)) AS DECIMAL) /
                    ((SELECT max_year_founded_diff FROM mins_maxs_attrs) - (SELECT min_year_founded_diff FROM mins_maxs_attrs)))), 0.5) normalized_year_founded_diff,
                    -- normalize number of common keywords to a number between 0-1, zero common keywords- 0, five common keywords- 1
                    COALESCE(CAST(tck.common_keywords_count AS DECIMAL) / 5, 0) AS normalized_keywords_diff,
                    d.industry_diff normalized_industry_diff,
                    d.locality_diff normalized_locality_diff,
                    d.country_diff normalized_country_diff
                
                FROM differences d
                LEFT JOIN target_common_keywords tck ON d.target_id = tck.target_id
            ),
            -- FIFTH HELPER: calc score between 0-1 based on assigning weight to each metric
            scored_targets AS (
                SELECT nm.*,
                        nm.normalized_industry_diff * ${INDUSTRY_WEIGHT} +
                        nm.normalized_keywords_diff * ${KEYWORDS_WEIGHT} +
                        nm.normalized_employee_count_diff * ${EMPLOYEES_COUNT_WEIGHT} +
                        nm.normalized_country_diff * ${COUNTRY_WEIGHT} +
                        nm.normalized_year_founded_diff * ${YEAR_FOUNDED_WEIGHT} +
                        nm.normalized_locality_diff * ${LOCALITY_WEIGHT} AS score
                FROM normalized_metrics nm
            ),
            -- SIX HELPER: add the company's keywords
            add_keywords AS (
                SELECT
                    c.id company_id,
                    STRING_AGG(k."name", ',') AS keywords
                FROM
                    company c
                JOIN
                    company_keywords_keyword ckk ON c.id = ckk.company_id
                JOIN
                    keyword k ON ckk.keyword_id = k.id
                GROUP BY
                    c.id
            )
            -- FINAL QUERY:
            SELECT
                (RANK() OVER(ORDER BY st.score DESC))::INTEGER rank,
                c.id,
                c.name,
                i."name" industry,
                c.website_url "websiteUrl",
                c.linkedin_url "linkedinUrl",
                c.tagline,
                c.about,
                c.year_founded "yearFounded",
                c.locality,
                c.country,
                c.employee_count_est "employeeCountEst",
                ak.keywords "keywordsStr"
            FROM company c
            JOIN scored_targets st ON c.id = st.target_id
            LEFT JOIN industry i ON c.industry_id = i.id
            LEFT JOIN add_keywords ak ON ak.company_id = c.id
            ORDER BY st.score DESC
            LIMIT ${limit || 'NULL'}
            OFFSET ${offset || 'NULL'};
        `)

        return companies.map(({keywordsStr, ...company}: Company & { keywordsStr: string }) => instanceToInstance({
            ...company,
            keywords: keywordsStr ? keywordsStr.split(',').map(kw => plainToInstance(Keyword, {name: kw})) : [],
        }))
    }
}