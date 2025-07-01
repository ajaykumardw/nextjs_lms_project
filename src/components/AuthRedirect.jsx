'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Config Imports
import themeConfig from '@configs/themeConfig'
import { usePermissionList } from '@/utils/getPermission'

// Util Imports

import { getLocalizedUrl } from '@/utils/i18n'


const AuthRedirect = ({ lang }) => {
  const pathname = usePathname()

  console.log("permission", usePermissionList);


  // ℹ️ Bring me `lang`
  const redirectUrl = `/${lang}/login?redirectTo=${pathname}`
  const login = `/${lang}/login`
  const homePage = getLocalizedUrl(themeConfig.homePageUrl, lang)

  return redirect(pathname === login ? login : pathname === homePage ? login : redirectUrl)
}

export default AuthRedirect
