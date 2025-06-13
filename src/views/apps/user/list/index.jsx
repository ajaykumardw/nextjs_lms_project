'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import UserListTable from './UserListTable'
import UserListCards from './UserListCards'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import SkeletonTableComponent from '@/components/skeleton/table/page'

const UserList = () => {

  const URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession() || {}
  const token = session?.user?.token
  const [userData, setUserData] = useState();
  const [isUserCardShow, setIsUserCardShow] = useState(true);


  const loadData = async () => {
    try {
      const response = await fetch(`${URL}/admin/company`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json();

      if (response.ok) {
        setUserData(data?.data?.company);
      }
    } catch (error) {
      console.log('Error occured', error);

    }

  }

  useEffect(() => {
    if (URL && token) {
      loadData();
    }
  }, [URL, token])

  if (!userData) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <UserListCards />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SkeletonTableComponent />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        {isUserCardShow ? (
          <UserListCards />
        ) : (
          <></>
        )}
      </Grid>
      <Grid size={{ xs: 12 }}>
        <UserListTable userData={userData} loadData={loadData} setIsUserCardShow={setIsUserCardShow} />
      </Grid>
    </Grid>
  )
}

export default UserList
