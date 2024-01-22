import {Company, CompanyRank} from '../interfaces/company'
import axios from 'axios'
import {CompanyOption} from '../interfaces/options'

const API_BASE_URL = `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api`

export async function getSearchOptions(): Promise<CompanyOption[]> {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/company/options`,
        )
        if (!response.data?.options) return []
        return response.data.options
    } catch (error) {
        console.error(error)
    }
    return []
}

export async function getCompanyById(id: number): Promise<Company | null> {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/company/${id}`,
        )
        if (!response.data?.company) return null
        return response.data.company
    } catch (error) {
        console.error(error)
    }
    return null
}

export async function getSimilarCompanies(id: number, limit = 10, page = 1): Promise<CompanyRank[]> {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/company/similar/${id}?limit=${limit}&offset=${(page - 1) * limit}`,
        )
        if (!response.data?.companies) return []
        return response.data.companies
    } catch (error) {
        console.error(error)
    }
    return []
}