// Component Imports
'use client'

import PermissionGuard from '@/hocs/PermissionClientGuard'
import Terminology from '@views/apps/terminology'
import { useParams } from 'next/navigation';

export default function TerminologyApp() {

  const { lang: locale } = useParams();

  return (
    <PermissionGuard locale={locale} element={'isSuperAdmin'}>
      <Terminology />
    </PermissionGuard>
  )
}
