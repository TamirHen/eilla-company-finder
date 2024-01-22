import React from 'react';
import './App.scss';
import {Autocomplete, createTheme, CssBaseline, TextField, ThemeProvider} from '@mui/material'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {getSearchOptions} from './utils/api'


function App() {
    const queryClient = useQueryClient()
    const {data: options, isLoading, error} = useQuery({queryKey: ['options'], queryFn: getSearchOptions})

    return (
        <main className="main">
            <div className="search-bar">
                <h1>
                    Search Bar
                </h1>
                <Autocomplete
                    options={options || []}
                    renderInput={params =>
                        <TextField label={'Search companies'} {...params}/>
                    }
                    renderOption={(props, option) =>
                        <li {...props} key={option.id}>
                            {option.label}
                        </li>}
                />
            </div>
            <div className="company-details">
            </div>
        </main>
    );
}

export default App;
