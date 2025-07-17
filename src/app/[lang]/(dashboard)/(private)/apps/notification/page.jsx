'use client'

import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'

import Tab from '@mui/material/Tab'

import { TabContext, TabList, TabPanel } from '@mui/lab'

import Courses from '@components/Courses'

import PermissionGuard from '@/hocs/PermissionClientGuard'


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

const NotificationTabs = ({ params }) => {

    const lang = 'en';

    const { data: session } = useSession()
    const token = session?.user?.token
    const URL = process.env.NEXT_PUBLIC_API_URL

    const [value, setValue] = useState('')
    const [data, setData] = useState(null);

    const handleTabChange = (event, newValue) => {

        setValue(newValue)

    }

    const slugify = (name) => {
        return name
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    const fetchCreate = async () => {
        try {

            const response = await fetch(`${URL}/company/notification/create`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const value = await response.json()

            if (response.ok) {

                const result = value?.data;

                setData(result);

            }

        } catch (error) {
            throw new Error(error)
        }
    }

    useEffect(() => {
        if (URL && token) {
            fetchCreate()
        }
    }, [URL, token])

    useEffect(() => {
        if (data) {
            console.log("Data", data);

            setValue(slugify(data?.notification_data?.[0]._id))
        }
    }, [data])

    if (!data) {
        return (
            <div>Loading</div>
        )
    }

    return (
        <PermissionGuard locale={lang} element='isUser'>
            <TabContext value={value}>
                <TabList variant='scrollable' onChange={handleTabChange} className='border-b px-0 pt-0'>
                    {data?.notification_data && data?.notification_data.map((item, index) => (
                        <Tab key={index} label={item?.type} value={item?._id} />
                    ))}
                </TabList>

                <div className='pt-0 mt-4'>
                    <TabPanel value={value} className='p-0'>
                        <Courses searchValue={moduleList} type={1} />
                    </TabPanel>
                </div>
            </TabContext>
        </PermissionGuard>
    )
}

export default NotificationTabs
