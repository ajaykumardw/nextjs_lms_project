'use client'
// Component Imports
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Permissions from '@views/apps/permission-module/index'
import SkeletonTableComponent from '@/components/skeleton/table/page'

const PermissionsApp = () => {
  const URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession() || {}
  const token = session?.user?.token
  const [data, setData] = useState()
  const [nameData, setNameData] = useState();

  const fetchPermissionModule = async () => {
    try {
      const response = await fetch(`${URL}/admin/permission-module`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })

      if (response.ok) {
    
        const result = await response.json()
        
        setData(result?.data?.allPermission)
        setNameData(result?.data?.nameData)
      } else {
        console.error('Failed to fetch data:', response.statusText)
      }

    } catch (error) {
      console.log("Error", error)
    }
  }

  useEffect(() => {
    if (URL && token) {
      fetchPermissionModule()
    }
  }, [URL, token])

  // Render loading or the permissions component
  return data ?
    <Permissions
      permissionsData={data}
      fetchPermissionModule={fetchPermissionModule}
      nameData={nameData}
    />
    :
    <SkeletonTableComponent />
}

export default PermissionsApp
