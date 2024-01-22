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

export interface CompanyOption {
    id: number
    label: string
}