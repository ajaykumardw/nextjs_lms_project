'use client'
// Component Imports
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DesignationComponent from '@/views/apps/designation/index'
import SkeletonTableComponent from '@/components/skeleton/table/page'

const DesignationApp = () => {
  const URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession() || {}
  const token = session?.user?.token
  const [data, setData] = useState()
  const [nameData, setNameData] = useState();

  const fetchDesignations = async () => {
    try {
      const response = await fetch(`${URL}/admin/designations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch designations');
      }

      setData(result.data || []);

    } catch (error) {
      console.error('Error fetching designations:', error.message);
      // Optionally show toast or UI feedback
      // toast.error(error.message || 'Something went wrong');
    }
  };


  useEffect(() => {
    if (URL && token) {
      fetchDesignations()
    }
  }, [URL, token])

  // Render loading or the permissions component
  return data ?
    <DesignationComponent
      permissionsData={data}
      fetchDesignations={fetchDesignations}
      nameData={nameData}
    />
    :
    <SkeletonTableComponent />
}

export default DesignationApp
