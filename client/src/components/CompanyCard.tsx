import React from 'react';
import './CompanyCard.scss'
import {Company} from '../interfaces/company'
import {Chip} from '@mui/material'
import {ReactComponent as EmployeesIcon} from '../assets/employees.svg';
import {ReactComponent as LinkedinIcon} from '../assets/linkedin.svg';
import {ReactComponent as LinkIcon} from '../assets/link.svg';
import {formatBrokenLink, nFormatter, titleCase} from '../utils/format'


interface Props {
    company: Company
    rank?: number
}

const CompanyCard = ({company, rank}: Props) => {

    const renderChip = (label: string) => <Chip className="data-chip" key={label} label={label}/>
    const renderEndSection = !!(company.employeeCountEst || company.websiteUrl || company.linkedinUrl || company.yearFounded)
    const location = company.locality || company.country || undefined

    return (
        <div className="company-card">
            <div className="card-main">
                <h2>{company.name}</h2>
                {company.tagline && <div className="tagline">{company.tagline}</div>}
                {company.industry && <div>
                    <h3>Industry</h3>
                    {company.industry}
                </div>}
                {location && <div>
                    <h3>Location</h3>
                    {titleCase(location)}
                </div>}
                {company.about && <div>
                    <h3>About</h3>
                    <p>{company.about}</p>
                </div>}
                {company.keywords.length ? <div>
                    <h3>Keywords</h3>
                    <div className="keywords">
                        {company.keywords.map(renderChip)}
                    </div>
                </div> : <></>}
            </div>
            {renderEndSection && <div className="card-info-end">
                {company.websiteUrl && <a href={formatBrokenLink(company.websiteUrl)} target="_blank"><LinkIcon/></a>}
                {company.linkedinUrl && <a href={formatBrokenLink(company.linkedinUrl)} target="_blank"><LinkedinIcon/></a>}
                {company.employeeCountEst && <div className="info-box">
                    <EmployeesIcon/>
                    {nFormatter(company.employeeCountEst, 0)}
                </div>}
                {company.yearFounded && <div className="info-box">
                    <div>SINCE</div>
                    {company.yearFounded}
                </div>}
                {rank && <div className="rank">{rank}</div>}
            </div>}
        </div>);
}

export default CompanyCard;