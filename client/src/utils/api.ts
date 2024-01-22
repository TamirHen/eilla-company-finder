import {Company, CompanyOption} from '../interfaces/company'
import axios from 'axios'

const API_BASE_URL = `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api`

export async function getSearchOptions(): Promise<CompanyOption[]> {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/company/options`
        )
        if (!response.data?.options) return []
        return response.data.options
    } catch (error) {
        console.error(error)
    }
    return []
}