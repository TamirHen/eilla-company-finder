import React, {ChangeEventHandler, FocusEventHandler, useState} from 'react';
import './App.scss';
import {Autocomplete, AutocompleteChangeReason, Button, Chip, CircularProgress, TextField} from '@mui/material'
import {useQuery} from '@tanstack/react-query'
import {getCompanyById, getSearchOptions, getSimilarCompanies} from './utils/api'
import {CompanyOption, PaginateOptions} from './interfaces/options'
import CompanyCard from './components/CompanyCard'
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos'
import NextIcon from '@mui/icons-material/ArrowForward';
import BackIcon from '@mui/icons-material/ArrowBack';

function App() {
    const [selectedOption, setSelectedOption] = useState<CompanyOption | null>(null)
    const [paginateOptions, setPaginateOptions] = useState<PaginateOptions>({
        pageNumber: 1,
        pageSize: 10,
    })
    const [findSimilar, setFindSimilar] = useState(false)
    const {data: options, isLoading: isOptionsLoading, error: optionsError} = useQuery({
        queryKey: ['options'],
        queryFn: getSearchOptions,
    })
    const {
        data: company,
        isLoading: isCompanyLoading,
        error: companyError,
    } = useQuery({
        queryKey: ['company', selectedOption],
        queryFn: () => getCompanyById(selectedOption!.id),
        enabled: !!selectedOption,
    })
    const {
        data: similarCompanies,
        refetch: refetchSimilarCompanies,
        isFetching: isSimilarCompaniesLoading,
        error: similarCompaniesError,
    } = useQuery({
        queryKey: ['similarCompanies', selectedOption, paginateOptions],
        placeholderData: [],
        queryFn: () => getSimilarCompanies(selectedOption!.id, paginateOptions.pageSize, paginateOptions.pageNumber),
        enabled: !!(selectedOption && findSimilar),
    })

    const loadCompanyHandler = (event: React.SyntheticEvent, newOption: CompanyOption | null) => {
        setSelectedOption(prev => newOption)
        setFindSimilar(prev => false)
    }

    const navigatePage = async (direction: 'next' | 'prev') => {
        setPaginateOptions(prevState => {
            let pageNumber = prevState.pageNumber
            if (direction === 'prev' && prevState.pageNumber > 1) {
                pageNumber--
            }
            if (direction === 'next') {
                pageNumber++
            }
            return {
                ...prevState,
                pageNumber,
            }
        })
    }

    const findSimilarHandler = () => setFindSimilar(prev => true)
    console.log(isSimilarCompaniesLoading)
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
                            onChange={loadCompanyHandler}
                            value={selectedOption}
                            renderInput={params => <TextField label={'Search'} {...params}/>}
                            renderOption={(props, option) =>
                                <li {...props} key={option.id}>
                                    {option.label}
                                </li>}
                        />
                        {company && <Button onClick={findSimilarHandler} className="button" variant="contained">
                            Find Similar
                            <ArrowForwardIcon fontSize="small"/>
                        </Button>}
                    </div>
                    {company &&
                        <div className="company-details">
                            <CompanyCard company={company}/>
                        </div>}
                </div>
            </div>
            <div className="similar-companies">
                {selectedOption && <div className="similar-companies-header">
                    <h2>Similar</h2>
                    <div className="inputs-wrapper">
                        <TextField
                            className="page-size-inpt"
                            type={'number'}
                            label="Page size"
                            onChange={event => setPaginateOptions(prev => ({
                                ...prev,
                                pageSize: Number(event.target.value) > 1 ? Number(event.target.value) : 1,
                            }))}
                            value={paginateOptions.pageSize}
                            InputProps={{inputProps: {min: 1}}}
                        />
                        {paginateOptions.pageNumber > 1 && <Button variant="contained" onClick={() => navigatePage('prev')}
                                 className="button move-btn">
                            <BackIcon fontSize="large"/>
                        </Button>}
                        <Button variant="contained" onClick={() => navigatePage('next')}
                                className="button move-btn">
                            <NextIcon fontSize="large"/>
                        </Button>
                    </div>
                </div>}
                <div className="results">
                    {isSimilarCompaniesLoading ? <CircularProgress/> : similarCompanies?.map(companyRank =>
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
