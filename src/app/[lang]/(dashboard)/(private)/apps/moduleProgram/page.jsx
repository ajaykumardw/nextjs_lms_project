'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

// Components
import Courses from '@components/Courses'

// Utils
import { getAcademyData } from '@/app/server/actions'

const FormLayoutsWithTabs = () => {
    const [value, setValue] = useState('micro_learning_module')
    const [academyData, setAcademyData] = useState(null)
    const [searchValue, setSearchValue] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAcademyData()
            setAcademyData(data)
        }

        fetchData()
    }, [])

    const handleTabChange = (event, newValue) => {
        setValue(newValue)
    }

    return (
        <TabContext value={value}>
            <TabList
                variant='scrollable'
                onChange={handleTabChange}
                className='border-b px-0 pt-0'
            >
                <Tab label='Micro learning module' value='micro_learning_module' />
                <Tab label='Live session' value='live_session' />
                <Tab label='LOOC' value='looc' />
                <Tab label='ILT' value='ilt' />
            </TabList>

            <div className='pt-0'>
                <TabPanel value='micro_learning_module' className='p-0'>
                    <Courses courseData={academyData?.courses} searchValue={searchValue} />
                </TabPanel>

                <TabPanel value='live_session' className='p-0'>
                    <Grid container spacing={6}>
                        <Grid xs={12} sm={6}>
                            <Courses courseData={academyData?.courses} searchValue={searchValue} />
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value='looc' className='p-0'>
                    <Grid container spacing={6}>
                        <Grid xs={12} sm={6}>
                            <Courses courseData={academyData?.courses} searchValue={searchValue} />
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value='ilt' className='p-0'>
                    <Grid container spacing={6}>
                        <Grid xs={12} sm={6}>
                            <Courses courseData={academyData?.courses} searchValue={searchValue} />
                        </Grid>
                    </Grid>
                </TabPanel>
            </div>
        </TabContext>
    )
}

export default FormLayoutsWithTabs
