import {Service} from 'typedi'
import {Company} from '@/models/Company'
import {BaseRepository} from '@/repositories/BaseRepository'
import {Like} from 'typeorm'

@Service()
export class CompanyRepository extends BaseRepository<Company> {
    protected constructor() {
        super(Company);
    }

    async findNames(query?: string): Promise<string[]> {
        const companyNames = await this.find({
            select: {
                name: true,
            },
            where: {
                name: Like(`%${query || ''}%`),
            },
        })

        return companyNames.map(company => company.name)
    }

    async findByName(name: string): Promise<Company[]> {
        return await this.find({
            where: {
                name,
            },
        })
    }

    async findSimilar(companyId: number, limit?: number): Promise<Company & {rank: number}[]> {
        return await this.manager.query(`
            -- calc difference of fields in source and target as numerical values
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
            -- calc min max attributes of numericals fields to use in normalization formula
            mins_maxs_attrs AS (
                SELECT
                    MIN(d.employee_diff) min_employee_diff,
                    MAX(d.employee_diff) max_employee_diff,
                    MIN(d.year_founded_diff) min_year_founded_diff,
                    MAX(d.year_founded_diff) max_year_founded_diff
                FROM differences d
            ),
            -- calc for each company how many common keywords it has with the source company
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
            -- all metrics that's been taken into account to calc simularity are normalized into a number between 0-1
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
            -- calc score between 0-1 based on assigning weight to each metric
            scored_targets AS (
                SELECT nm.*,
                        nm.normalized_industry_diff * 0.4 +
                        nm.normalized_keywords_diff * 0.2 +
                        nm.normalized_employee_count_diff * 0.15 +
                        nm.normalized_country_diff * 0.2 +
                        nm.normalized_year_founded_diff * 0.025 +
                        nm.normalized_locality_diff * 0.025 AS score
                FROM normalized_metrics nm
            )
            SELECT
                RANK() OVER(ORDER BY st.score DESC) rank,
                c.*
            FROM company c
            JOIN scored_targets st ON c.id = st.target_id
            ORDER BY st.score DESC
            LIMIT ${limit || 'NULL'};
        `)
    }
}