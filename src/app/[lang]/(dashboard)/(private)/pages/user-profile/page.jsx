'use client'

import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react'

// Component Imports
import UserProfile from '@views/pages/user-profile'

const ProfileTab = dynamic(() => import('@views/pages/user-profile/profile'))

// Vars
const tabContentList = data => ({
  profile: <ProfileTab data={data?.user} />,
})

const ProfilePage = () => {

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession()
  const token = session?.user?.token

  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  const getProfileDataFun = async () => {
    try {

      const res = await fetch(`${API_URL}/company/user/profile/data`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {

        const data = await res.json()

        setProfileData(data?.data)
        setLoading(false)

      }

    } catch (error) {
      console.error(error)
    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {

    if (token) {
      getProfileDataFun()
    }
  }, [token, API_URL])

  if (loading) return <div>Loading...</div>

  return (
    <UserProfile
      data={profileData}
      tabContentList={tabContentList(profileData)}
    />
  )
}

export default ProfilePage
