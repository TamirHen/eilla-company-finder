import React, {useState} from 'react';
import './App.scss';
import _ from 'lodash'
import {Autocomplete, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material'
import {useQuery} from '@tanstack/react-query'
import {getCompanyById, getSearchOptions, getSimilarCompanies} from './utils/api'
import {CompanyOption, PaginateOptions} from './interfaces/options'
import CompanyCard from './components/CompanyCard'
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos'
import NextIcon from '@mui/icons-material/ArrowForward';
import BackIcon from '@mui/icons-material/ArrowBack';

function App() {
    const [selectedOption, setSelectedOption] = useState<CompanyOption | null>(null)
    const [pagination, setPagination] = useState<PaginateOptions>({
        pageNumber: 1,
        pageSize: 10,
    })
    const [findSimilar, setFindSimilar] = useState(false)
    const {data: options, isLoading: isOptionsLoading, error: optionsError} = useQuery({
        queryKey: ['options'],
        queryFn: getSearchOptions,
    })
    const {
        data: searchedCompany
    } = useQuery({
        queryKey: ['company', selectedOption],
        queryFn: () => getCompanyById(selectedOption!.id),
        enabled: !!selectedOption,
    })
    const {
        // scr- similar companies response
        data: scr,
        isFetching: isSimilarCompaniesLoading
    } = useQuery({
        queryKey: ['similarCompanies', selectedOption, pagination],
        placeholderData: {
            pageNumber: 1,
            totalPages: 1,
            companies: [],
        },
        queryFn: () => getSimilarCompanies(selectedOption!.id, pagination.pageSize, pagination.pageNumber),
        enabled: !!(selectedOption && findSimilar),
    })

    // when company is selected in the Autocomplete selectedOption state changes and useQuery invokes API call to fetch the searched company
    const companySearchedHandler = (event: React.SyntheticEvent, newOption: CompanyOption | null) => {
        setSelectedOption(prev => newOption)

        // if second search is performed and similar companies are mounted, unmount similar companies
        setFindSimilar(prev => false)
    }

    // handle similar companies pagination
    const navigatePageHandler = async (direction: 'next' | 'prev') => {
        setPagination(prevState => {
            let pageNumber = prevState.pageNumber
            if (direction === 'prev' && prevState.pageNumber > 1) {
                pageNumber--
            }
            if (direction === 'next' && prevState.pageNumber < scr!.totalPages) {
                pageNumber++
            }
            return {
                ...prevState,
                pageNumber,
            }
        })
    }

    // Change findSimilar state which causes useQuery to invoke API call to fetch similar companies
    const findSimilarHandler = () => {
        setFindSimilar(prev => true)
        // reset pagination to first page
        setPagination(prev => ({...prev, pageNumber: 1}))
    }

    return (
        <main className="main">
            <div className="company-finder">
                <div>
                    <h1>
                        Company Finder
                    </h1>
                    <div className="search-wrapper">
                        <Autocomplete
                            options={options || []}
                            className={'search-input'}
                            onChange={companySearchedHandler}
                            value={selectedOption}
                            renderInput={params => <TextField label={'Search'} {...params}/>}
                            renderOption={(props, option) =>
                                <li {...props} key={option.id}>
                                    {option.label}
                                </li>}
                        />
                        {searchedCompany && <Button onClick={findSimilarHandler} className="button" variant="contained">
                            Find Similar
                            <ArrowForwardIcon fontSize="small"/>
                        </Button>}
                    </div>
                    {searchedCompany &&
                        <div className="company-details">
                            <CompanyCard company={searchedCompany}/>
                        </div>}
                </div>
            </div>
            <div className="similar-companies">
                {selectedOption && <div className="similar-companies-header">
                    <h2>Results</h2>
                    <div className="inputs-wrapper">
                        <TextField
                            className="page-size-inpt"
                            type={'number'}
                            label="Page size"
                            onChange={event => setPagination(prev => ({
                                ...prev,
                                pageSize: Number(event.target.value) > 1 ? Number(event.target.value) : 1,
                            }))}
                            value={pagination.pageSize}
                            InputProps={{inputProps: {min: 1}}}
                        />
                        <FormControl>
                            <InputLabel id='page-select-label'>Page</InputLabel>
                            <Select
                                labelId="page-select-label"
                                label="Page"
                                className='page-select'
                                onChange={(event) => setPagination(prev => ({...prev, pageNumber: Number(event.target.value) || 1}))}
                                type={'number'}
                                value={pagination.pageNumber}
                            >
                                {_.range(1, scr!.totalPages + 1).map((page) => <MenuItem key={page} value={page}>{page}</MenuItem>)}
                            </Select>
                        </FormControl>
                        {pagination.pageNumber > 1 &&
                            <Button variant="contained" onClick={() => navigatePageHandler('prev')}
                                    className="button move-btn">
                                <BackIcon fontSize="large"/>
                            </Button>}
                        {pagination.pageNumber < scr!.totalPages &&
                            <Button variant="contained" onClick={() => navigatePageHandler('next')}
                                    className="button move-btn">
                                <NextIcon fontSize="large"/>
                            </Button>}
                    </div>
                </div>}
                <div className="results">
                    {(isSimilarCompaniesLoading || !scr) ? <CircularProgress/> : scr.companies?.map(companyRank =>
                        <div className="ranked-company" key={companyRank.company.id}>
                            <CompanyCard company={companyRank.company}
                                         rank={companyRank.rank}/>
                        </div>)}
                </div>
            </div>
        </main>
    );
}

export default App