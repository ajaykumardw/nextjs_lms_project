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

    const moduleList = [
        {
            id: 1,
            tutorImg: '/images/apps/academy/1.png',
            courseTitle: 'Basics of Angular',
            tags: 'Web',
            percentage: 40
        },
        {
            id: 2,
            tutorImg: '/images/apps/academy/2.png',
            courseTitle: 'UI/UX Design',
            tags: 'Design',
            percentage: 60
        },
        {
            id: 3,
            tutorImg: '/images/apps/academy/3.png',
            courseTitle: 'React Native',
            tags: 'Web',
            percentage: 50
        }
    ]

    const liveList = [{
        id: 4,
        tutorImg: '/images/apps/academy/4.png',
        courseTitle: 'Art & Drawing',
        tags: 'Design',
        percentage: 20
    },
    {
        id: 5,
        tutorImg: '/images/apps/academy/5.png',
        courseTitle: 'Basic Fundamentals',
        tags: 'Web',
        percentage: 10
    },
    {
        id: 6,
        tutorImg: '/images/apps/academy/6.png',
        courseTitle: 'React for Beginners',
        tags: 'Web',
        percentage: 40
    },];

    const loocList = [
        {
            id: 7,
            tutorImg: '/images/apps/academy/1.png',
            courseTitle: 'The Science of Critical Thinking',
            tags: 'Psychology',
            percentage: 90
        },
        {
            id: 8,
            tutorImg: '/images/apps/academy/2.png',
            courseTitle: 'The Complete Figma UI/UX Course',
            tags: 'Design',
            percentage: 80
        },
        {
            id: 9,
            tutorImg: '/images/apps/academy/3.png',
            courseTitle: 'Advanced Problem Solving Techniques',
            tags: 'Psychology',
            percentage: 20
        }
    ]

    const iltList = [
        {
            id: 10,
            tutorImg: '/images/apps/academy/4.png',
            courseTitle: 'Advanced React Native',
            tags: 'Web',
            percentage: 40
        }
    ];

    return (
        <TabContext value={value}>
            <TabList
                variant='scrollable'
                onChange={handleTabChange}
                className='border-b px-0 pt-0'
            >
                <Tab key={1} label='Micro learning module' value='micro_learning_module' />
                <Tab key={2} label='Live session' value='live_session' />
                <Tab key={3} label='LOOC' value='looc' />
                <Tab key={4} label='ILT' value='ilt' />
            </TabList>

            <div className='pt-0 mt-4'>
                <TabPanel value='micro_learning_module' className='p-0'>
                    <Courses courseData={academyData?.courses} searchValue={moduleList} type={1} />
                </TabPanel>

                <TabPanel value='live_session' className='p-0'>
                    <Courses courseData={academyData?.courses} searchValue={liveList} type={1} />
                </TabPanel>

                <TabPanel value='looc' className='p-0'>
                    <Courses courseData={academyData?.courses} searchValue={loocList} type={1} />
                </TabPanel>

                <TabPanel value='ilt' className='p-0'>
                    <Courses courseData={academyData?.courses} searchValue={iltList} type={1} />
                </TabPanel>
            </div>
        </TabContext>
    )
}

export default FormLayoutsWithTabs
