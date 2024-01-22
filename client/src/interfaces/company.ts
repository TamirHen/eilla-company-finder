export interface Company {
    readonly id: number
    name: string
    industry?: string
    websiteUrl?: string
    linkedinUrl?: string
    tagline?: string
    about?: string
    yearFounded?: number
    locality?: string
    country?: string
    employeeCountEst?: number
    keywords: string[]
}

export interface SimilarCompaniesResponse {
    pageNumber: number
    totalPages: number
    companies: CompanyRank[]
}

export interface CompanyRank {
    rank: number
    company: Company
}