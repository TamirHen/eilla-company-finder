import path from 'path'
import Papa, {ParseResult} from 'papaparse'
import {createReadStream} from 'fs'
import {ReadStream} from 'typeorm/browser/platform/BrowserPlatformTools'
import dataSource from '@/data-source'
import {Company} from '@/models/Company'
import {Industry} from '@/models/Industry'
import {Keyword} from '@/models/Keyword'
import {plainToInstance} from 'class-transformer'
import _ from 'lodash'

interface Row {
    'linkedin url': string
    'company_name': string
    'industry': string
    'website': string
    'tagline': string
    'about': string
    'year founded': string
    'locality': string
    'country': string
    'current employee estimate': string
    'keywords': string
}

/**
 * Read resource CSV file.
 * Convert the rows into entities and inject them into the database in bulks.
 */
(async () => {
    console.log('Reading rows from CSV file...')
    const csvFilePath = path.resolve(__dirname, '../resources/companies_data.csv')
    const csvFile = createReadStream(csvFilePath)
    Papa.parse<Row>(csvFile, {
        header: true,
        delimiter: ',',
        dynamicTyping: true,
        complete: async ({data}: ParseResult<Row>, file: ReadStream) => {
            await injectRows(data)
            console.log('Company seed process finished successfully')
        },
        error: (error: Error, file: string) => {
            console.error(`\nError parsing companies CSV file: ${error.message}\n`)
            throw error
        },
    })
})()

async function injectRows(rows: Row[]): Promise<void> {
    console.log('Connecting to database...')
    await dataSource.initialize()

    console.log('Preparing data to be inserted in bulks...')
    // remove duplicates and convert string industries into entities
    let industries =
        _.uniq(
            rows.map(row => row.industry?.trim(),
            ),
        )
            .filter(industry => industry)
            .map(industry => plainToInstance(Industry, {name: industry}))


    // split comma-seperated keywords, remove duplicates, and convert string keywords into entities
    let keywords =
        _.uniq(
            _.flatten(
                rows.map(
                    row => stringToArray(row.keywords, ','),
                ),
            ),
        )
            .filter(kw => kw)
            .map(keyword => plainToInstance(Keyword, {name: keyword}))


    console.log('Upserting industries into the database...')
    await dataSource.getRepository(Industry).upsert(industries, {
        conflictPaths: ['name'],
        skipUpdateIfNoValuesChanged: true,
    })
    console.log('Upserting keywords into the database...')
    await dataSource.getRepository(Keyword).upsert(keywords, {
        conflictPaths: ['name'],
        skipUpdateIfNoValuesChanged: true,
    })

    // set entities in a hash map structures where key is name and value is entity
    industries = await dataSource.getRepository(Industry).find()
    const industriesMap = _.keyBy(industries, industry => industry.name)
    keywords = await dataSource.getRepository(Keyword).find()
    const keywordsMap = _.keyBy(keywords, keyword => keyword.name)

    let companies: Company[] = []
    console.log('Mapping rows to entities...')
    for (const row of rows) {
        // convert comma-seperated keywords to entities
        const keywordEntities = stringToArray(row.keywords, ',').map(keyword => keywordsMap[keyword])
        // convert row to Company entity
        companies.push(plainToInstance(Company, {
            name: row.company_name,
            industry: row.industry ? industriesMap[row.industry.trim()] : null,
            websiteUrl: row.website || null,
            linkedinUrl: row['linkedin url'] || null,
            tagline: row.tagline || null,
            about: row.about || null,
            yearFounded: row['year founded'] || null,
            locality: row.locality || null,
            country: row.country || null,
            employeeCountEst: row['current employee estimate'] || null,
            keywords: keywordEntities
        }))
    }
    console.log('Saving companies into the database...')
    await dataSource.getRepository(Company).save(companies)
}


function stringToArray(str: string | undefined, delimiter: string): string[] {
    if (!str) return []
    return str.split(delimiter)
        .map(kw => kw.trim())
}