'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

import Button from '@mui/material/Button'

import Tab from '@mui/material/Tab'

import TabContext from '@mui/lab/TabContext'

import TabPanel from '@mui/lab/TabPanel'

import Typography from '@mui/material/Typography'

import Course from '@components/Courses';

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const Courses = ({ tabContentList }) => {
    // States
    const [activeTab, setActiveTab] = useState('store-detail')
    const [searchData, setSearchData] = useState([])

    const handleChange = (event, value) => {
        setActiveTab(value)
    }

    const coursesData = [
        { label: 'Store Detail', iconPosition: 'start', value: 'store-detail' },
        { label: 'Product Management', iconPosition: 'start', value: 'product-management' },
        { label: 'Inventory Tracking', iconPosition: 'start', value: 'inventory-tracking' },
        { label: 'Order History', iconPosition: 'start', value: 'order-history' },
        { label: 'Customer Reviews', iconPosition: 'start', value: 'customer-reviews' },
        { label: 'Sales Reports', iconPosition: 'start', value: 'sales-reports' },
        { label: 'Promotions & Discounts', iconPosition: 'start', value: 'promotions-discounts' },
        { label: 'Shipping Settings', iconPosition: 'start', value: 'shipping-settings' },
        { label: 'Store Policies', iconPosition: 'start', value: 'store-policies' },
        { label: 'User Management', iconPosition: 'start', value: 'user-management' }
    ]

    const courseListData = {
        'store-detail': [
            {
                id: 1,
                tutorImg: '/images/apps/academy/1.png',
                courseTitle: 'Basics of Angular',
                tags: 'Web',
            },
            {
                id: 2,
                tutorImg: '/images/apps/academy/2.png',
                courseTitle: 'UI/UX Design',
                tags: 'Design',
            },
            {
                id: 3,
                tutorImg: '/images/apps/academy/3.png',
                courseTitle: 'React Native',
                tags: 'Web',
            }
        ],
        'product-management': [
            {
                id: 4,
                tutorImg: '/images/apps/academy/4.png',
                courseTitle: 'Product Lifecycle Basics',
                tags: 'Business',
            },
            {
                id: 5,
                tutorImg: '/images/apps/academy/5.png',
                courseTitle: 'Agile Product Ownership',
                tags: 'Management',
            }
        ],
        'inventory-tracking': [
            {
                id: 6,
                tutorImg: '/images/apps/academy/6.png',
                courseTitle: 'Inventory with Excel',
                tags: 'Tools',
            },
            {
                id: 7,
                tutorImg: '/images/apps/academy/7.png',
                courseTitle: 'Warehouse Management Systems',
                tags: 'Logistics',
            }
        ],
        'order-history': [
            {
                id: 8,
                tutorImg: '/images/apps/academy/8.png',
                courseTitle: 'Understanding Order Flow',
                tags: 'E-Commerce',
            }
        ],
        'customer-reviews': [
            {
                id: 9,
                tutorImg: '/images/apps/academy/9.png',
                courseTitle: 'Handling Negative Feedback',
                tags: 'Support',
            },
            {
                id: 10,
                tutorImg: '/images/apps/academy/10.png',
                courseTitle: 'Building Customer Trust',
                tags: 'Marketing',
            }
        ],
        'sales-reports': [
            {
                id: 11,
                tutorImg: '/images/apps/academy/11.png',
                courseTitle: 'Intro to Data Visualization',
                tags: 'Analytics',
            },
            {
                id: 12,
                tutorImg: '/images/apps/academy/12.png',
                courseTitle: 'Creating Sales Dashboards',
                tags: 'Business',
            }
        ],
        'promotions-discounts': [
            {
                id: 13,
                tutorImg: '/images/apps/academy/13.png',
                courseTitle: 'Pricing Strategies',
                tags: 'Marketing',
            },
            {
                id: 14,
                tutorImg: '/images/apps/academy/14.png',
                courseTitle: 'Running Seasonal Campaigns',
                tags: 'Sales',
            }
        ],
        'shipping-settings': [
            {
                id: 15,
                tutorImg: '/images/apps/academy/15.png',
                courseTitle: 'Logistics 101',
                tags: 'Operations',
            },
            {
                id: 16,
                tutorImg: '/images/apps/academy/16.png',
                courseTitle: 'International Shipping Basics',
                tags: 'Logistics',
            }
        ],
        'store-policies': [
            {
                id: 17,
                tutorImg: '/images/apps/academy/17.png',
                courseTitle: 'Writing Clear Return Policies',
                tags: 'Legal',
            },
            {
                id: 18,
                tutorImg: '/images/apps/academy/18.png',
                courseTitle: 'GDPR for Online Stores',
                tags: 'Compliance',
            }
        ],
        'user-management': [
            {
                id: 19,
                tutorImg: '/images/apps/academy/19.png',
                courseTitle: 'Admin Dashboard Training',
                tags: 'Admin',
            },
            {
                id: 20,
                tutorImg: '/images/apps/academy/20.png',
                courseTitle: 'Role-based Access Control',
                tags: 'Security',
            }
        ]
    };

    useEffect(() => {
        if (activeTab) {
            setSearchData(courseListData[activeTab]);
        }
    }, [activeTab])

    return (
        <TabContext value={activeTab}>
            <Grid container spacing={6}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Typography variant='h5' className='mbe-4'>
                        My Courses
                    </Typography>
                    <CustomTabList orientation='vertical' onChange={handleChange} className='is-full' pill='true'>
                        {coursesData && coursesData.map((item, index) => (
                            <Tab
                                key={index}
                                label={item.label}
                                icon={<i className='tabler-bell-ringing' />}
                                iconPosition="start"
                                value={item.value}
                                className='flex-row justify-start !min-is-full'
                            />
                        ))}
                    </CustomTabList>
                </Grid>
                <Grid item size={{ xs: 12, md: 8 }}>
                    <TabPanel value={activeTab} className='p-0'>
                        <Course searchValue={searchData} type={0} />
                    </TabPanel>
                </Grid>
            </Grid>
        </TabContext>
    )
}

export default Courses
