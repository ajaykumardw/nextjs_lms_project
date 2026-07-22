'use client'

import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'

import Grid from '@mui/material/Grid2'

import SkeletonTableComponent from '@/components/skeleton/table/page'

import UserListTable from './UserListTable'

import UserListCards from './UserListCards'

import { useApi } from '../../../../utils/api'

const UserList = () => {
  const URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession() || {}
  const token = session?.user?.token

  const [userData, setUserData] = useState([])
  const [statsData, setStatsData] = useState()

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const { doGet } = useApi()
  const [isUserCardShow, setIsUserCardShow] = useState(true)

  const [search, setSearch] = useState('')
  const [totalUsers, setTotalUsers] = useState(0)

  const loadData = async (
    currentPage = page,
    currentPageSize = pageSize,
    currentSearch = search
  ) => {
    try {
      const apiPage = currentPage + 1

      const queryParams = new URLSearchParams({
        page: String(apiPage),
        limit: String(currentPageSize),
        search: currentSearch
      })

      const response = await fetch(
        `${URL}/admin/company?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (response.ok) {
        setUserData(data?.data?.company || [])
        setTotalUsers(data?.data?.pagination?.total || 0)
      }
    } catch (error) {
      console.log('Error occurred', error)
    }
  }

  const getStatsCount = async () => {
    const statsData = await doGet(`admin/users/stats`)

    if (statsData) {
      setStatsData(statsData)
    }
  }

  useEffect(() => {
    if (URL && token) {

      getStatsCount()
    }
  }, [URL, token])

  useEffect(() => {
    if (URL && token) {
      loadData(page, pageSize, search)
    }
  }, [URL, token, page, pageSize, search])

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
        {isUserCardShow && <UserListCards {...statsData} />}
      </Grid>

      <Grid size={{ xs: 12 }}>
        <UserListTable
          userData={userData}
          totalUsers={totalUsers}
          page={page}
          pageSize={pageSize}
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          setPageSize={setPageSize}
          loadData={loadData}
          setIsUserCardShow={setIsUserCardShow}
          getStatsCount={getStatsCount}
        />
      </Grid>
    </Grid>
  )
}

export default UserList
