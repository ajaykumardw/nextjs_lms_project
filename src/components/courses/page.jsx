'use client'

// React Imports
import { useState } from 'react'

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

    return (
        <TabContext value={activeTab}>
            <Grid container spacing={6}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant='h5' className='mbe-4'>
                        Getting Started
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
                <Grid size={{ xs: 12, md: 8 }}>
                    <Grid container spacing={6}>
                        <Grid size={{ xs: 12 }}>
                            <TabPanel value={activeTab} className='p-0'>
                                <Course />
                            </TabPanel>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <div className='flex justify-end gap-4'>
                                <Button variant='tonal' color='secondary'>
                                    Discard
                                </Button>
                                <Button variant='contained'>Save Changes</Button>
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </TabContext>
    )
}

export default Courses
