'use client'

import { useParams } from 'next/navigation'

import CategoryLayout from '@/views/apps/category/CategoryLayout'

import PermissionGuard from '@/hocs/PermissionClientGuard'

const CategoryApp = () => {

  const { lang: locale } = useParams()

  return (
    <PermissionGuard locale={locale} element={'isCompany'}>
      <CategoryLayout type="module" />
    </PermissionGuard>
  )

}

export default CategoryApp
