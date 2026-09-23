'use client'

// Next Imports
import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import { Skeleton } from '@mui/material'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import CustomChip from '@core/components/mui/Chip'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports

import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale, role: role } = params


  const [permissArray, setPermissArray] = useState()

  const { data: session } = useSession()
  const token = session?.user?.token
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const fetchPermissionList = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/role/allow/permission`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {

        setPermissArray(data?.data || [])
      } else {
        console.error('Failed to fetch permissions:', data?.message)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  useEffect(() => {
    if (API_URL && token) {
      fetchPermissionList()
    }
  }, [API_URL, token])

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  if (!permissArray) {
    return <Skeleton variant="rectangular" height={400} />
  }

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false),
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true),
        })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => (
          <RenderExpandIcon open={open} transitionDuration={transitionDuration} />
        )}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >

        {(permissArray?.notUser) && (
          <MenuItem
            key={"dashboard"}
            href={`/${locale}/dashboard/lms`}
            icon={<i className='tabler-smart-home' />}
          >
            Dashboard
          </MenuItem>
        )}

        {permissArray?.isUser && (
          <MenuItem
            key={"dashboard"}
            href={`/${locale}/dashboard/user/learner`}
            icon={<i className='tabler-smart-home' />}
          >
            Dashboard
          </MenuItem>
        )}
        {/* <SubMenu label="Front Pages" icon={<i className='tabler-files' />}>
          <MenuItem href='/front-pages/landing-page' target='_blank'>
            Landing
          </MenuItem>
          <MenuItem href='/front-pages/pricing' target='_blank'>
            Pricing
          </MenuItem>
          <MenuItem href='/front-pages/payment' target='_blank'>
            Payment
          </MenuItem>
          <MenuItem href='/front-pages/checkout' target='_blank'>
            Checkout
          </MenuItem>
          <MenuItem href='/front-pages/help-center' target='_blank'>
            HelpCenter
          </MenuItem>
        </SubMenu> */}
        <MenuSection label="App Pages">
          {/* <SubMenu label="ECommerce" icon={<i className='tabler-shopping-cart' />}>
            <MenuItem href={`/${locale}/apps/ecommerce/dashboard`}>Dashboard</MenuItem>
            <SubMenu label="Products">
              <MenuItem href={`/${locale}/apps/ecommerce/products/list`}>List</MenuItem>
              <MenuItem href={`/${locale}/apps/ecommerce/products/add`}>Add</MenuItem>
              <MenuItem href={`/${locale}/apps/ecommerce/products/category`}>
                Category
              </MenuItem>
            </SubMenu>
            <SubMenu label="orders">
              <MenuItem href={`/${locale}/apps/ecommerce/orders/list`}>List</MenuItem>
              <MenuItem
                href={`/${locale}/apps/ecommerce/orders/details/5434`}
                exactMatch={false}
                activeUrl='/apps/ecommerce/orders/details'
              >
                Details
              </MenuItem>
            </SubMenu>
            <SubMenu label="Customers">
              <MenuItem href={`/${locale}/apps/ecommerce/customers/list`}>List</MenuItem>
              <MenuItem
                href={`/${locale}/apps/ecommerce/customers/details/879861`}
                exactMatch={false}
                activeUrl='/apps/ecommerce/customers/details'
              >
                details
              </MenuItem>
            </SubMenu>
            <MenuItem href={`/${locale}/apps/ecommerce/manage-reviews`}>
              Manage Reviews
            </MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/referrals`}>Referrals</MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/settings`}>Settings</MenuItem>
          </SubMenu>
          <SubMenu label="Academy" icon={<i className='tabler-school' />}>
            <MenuItem href={`/${locale}/apps/academy/dashboard`}>Dashboard</MenuItem>
            <MenuItem href={`/${locale}/apps/academy/my-courses`}>MyCourses</MenuItem>
            <MenuItem href={`/${locale}/apps/academy/course-details`}>
              Course Details
            </MenuItem>
          </SubMenu>
          <SubMenu label="Logistics" icon={<i className='tabler-truck' />}>
            <MenuItem href={`/${locale}/apps/logistics/dashboard`}>Dashboard</MenuItem>
            <MenuItem href={`/${locale}/apps/logistics/fleet`}>Fleet</MenuItem>
          </SubMenu>
          <MenuItem
            href={`/${locale}/apps/email`}
            icon={<i className='tabler-mail' />}
            exactMatch={false}
            activeUrl='/apps/email'
          >
            Email
          </MenuItem>
          <MenuItem href={`/${locale}/apps/chat`} icon={<i className='tabler-message-circle-2' />}>
            Chat
          </MenuItem>
          <MenuItem href={`/${locale}/apps/calendar`} icon={<i className='tabler-calendar' />}>
            Calendar
          </MenuItem>
          <MenuItem href={`/${locale}/apps/kanban`} icon={<i className='tabler-copy' />}>
            Kanban
          </MenuItem>
          <SubMenu label="Invoice" icon={<i className='tabler-file-description' />}>
            <MenuItem href={`/${locale}/apps/invoice/list`}>List</MenuItem>
            <MenuItem
              href={`/${locale}/apps/invoice/preview/4987`}
              exactMatch={false}
              activeUrl='/apps/invoice/preview'
            >
              Preview
            </MenuItem>
            <MenuItem href={`/${locale}/apps/invoice/edit/4987`} exactMatch={false} activeUrl='/apps/invoice/edit'>
              Edit
            </MenuItem>
            <MenuItem href={`/${locale}/apps/invoice/add`}>Add</MenuItem>
          </SubMenu> */}
          {permissArray?.isSuperAdmin && (
            <SubMenu label="Role & Permission" icon={<i className="tabler-lock" />}>
              <MenuItem key="Role" href={`/${locale}/apps/roles`}>Roles</MenuItem>
              <MenuItem key="PermissionModule" href={`/${locale}/apps/permission-module`}>Permission module</MenuItem>
              <MenuItem key="Permission" href={`/${locale}/apps/permission`}>Permission</MenuItem>
              <MenuItem key="PackageType" href={`/${locale}/apps/package-type`}>Package type</MenuItem>
              <MenuItem key="Package" href={`/${locale}/apps/package`}>Package</MenuItem>
            </SubMenu>
          )}

          {permissArray?.isUser && (
            <SubMenu label="Batch & Session" icon={<i className="tabler-lock" />}>
              <MenuItem key="batch_session_index" href={`/${locale}/apps/batch-session`}>View</MenuItem>
              <MenuItem key="batches_index" href={`/${locale}/apps/batch-session/batches`}>Batches</MenuItem>
              <MenuItem key="batch_grading_index" href={`/${locale}/apps/batch-session/resource/grading`}>Grading</MenuItem>
            </SubMenu>
          )}

          {permissArray?.isUser && (
            <SubMenu label="ILT Module" icon={<i className="tabler-lock" />}>
              <MenuItem key="ilt_module_index" href={`/${locale}/apps/ilt-module`}>View</MenuItem>
              <MenuItem key="batches_index" href={`/${locale}/apps/ilt-module/batch-list`}>Batches</MenuItem>
              <MenuItem key="batch_grading_index" href={`/${locale}/apps/ilt-module/enrollment`}>Enrollment</MenuItem>
            </SubMenu>
          )}

          {permissArray?.isUser && (
            <>

              <MenuItem key="leaderboard" href={`/${locale}/apps/leaderboard`} icon={<i className="tabler-puzzle" style={{ insetInlineEnd: 8, fontSize: '1.2rem' }} />}>
                Leaderboard
              </MenuItem>

              <MenuItem key="team" href={`/${locale}/apps/my-team`} icon={<i className="tabler-users" style={{ insetInlineEnd: 8 }} />}>
                Team
              </MenuItem>

              <MenuItem key="self_enroll_module" href={`/${locale}/apps/self-enroll`} icon={<i className="tabler-users" />}>
                Self Enroll Module
              </MenuItem>

              <MenuItem key="courses" href={`/${locale}/apps/my-courses`} icon={<i className="tabler-book" />}>
                My Course
              </MenuItem>

              <MenuItem key="module_in_progress" href={`/${locale}/apps/my-modules/in-progress`} icon={<i className="tabler-folder" />}>
                Module in progress
              </MenuItem>

              <MenuItem key="my_program" href={`/${locale}/apps/my-program`} icon={<i className="tabler-folder" />}>
                My Program
              </MenuItem>

              <MenuItem key="certificates" href={`/${locale}/apps/my-certificates`} icon={<i className="tabler-certificate" />}>
                My Certificate
              </MenuItem>
            </>
          )}
          {permissArray?.isCompany && (
            <MenuItem key="training_and_program" href={`/${locale}/apps/program`} icon={<i className="tabler-adjustments" />}>Training Program</MenuItem>
          )}
          {permissArray?.isCompany && permissArray?.hasRolePermission && (
            <MenuItem key="role_and_permission" href={`/${locale}/apps/role`} icon={<i className="tabler-lock" />}>Role & Permission</MenuItem>
          )}
          {permissArray?.isCompany && (permissArray?.hasZonePermission || permissArray?.hasRegionPermission || permissArray?.hasBranchPermission || permissArray?.hasChannelPermission || permissArray?.hasDepartmentPermission || permissArray?.hasDesignationPermission) && (
            <SubMenu label={dictionary['navigation']['manage-organization_plural']} icon={<i className='tabler-world' />}>
              {permissArray?.hasZonePermission && (
                <MenuItem href={`/${locale}/apps/zones`}>
                  {dictionary['navigation'].zone_plural}
                </MenuItem>
              )}
              {permissArray?.hasRegionPermission && (
                <MenuItem href={`/${locale}/apps/region`}>
                  {dictionary['navigation'].region_plural}
                </MenuItem>
              )}
              {permissArray?.hasBranchPermission && (
                <MenuItem href={`/${locale}/apps/branch`}>
                  {dictionary['navigation'].branch_plural}
                </MenuItem>
              )}
              {permissArray?.hasChannelPermission && (
                <MenuItem href={`/${locale}/apps/channels`}>
                  {dictionary['navigation'].channel_plural}
                </MenuItem>
              )}
              {permissArray?.hasDepartmentPermission && (
                <MenuItem href={`/${locale}/apps/departments`}>
                  {dictionary['navigation'].department_plural}
                </MenuItem>
              )}
              {permissArray?.hasDesignationPermission && (
                <MenuItem href={`/${locale}/apps/designations`}>
                  {dictionary['navigation'].designation_plural}
                </MenuItem>
              )}
              <MenuItem href={`/${locale}/apps/participation-types`}>
                Participation type
              </MenuItem>
            </SubMenu>
          )}
          {permissArray?.isSuperAdmin && (
            <MenuItem key={"company_listing"} href={`/${locale}/apps/company/list`} icon={<i className='tabler-user' />}>Company</MenuItem>
          )}
          {permissArray?.isCompany && permissArray?.hasUserPermission && (

            <MenuItem href={`/${locale}/apps/user/list`} icon={<i className='tabler-user' />}>{dictionary['navigation'].user_plural}</MenuItem>

          )}
          {permissArray?.isCompany && permissArray?.hasGroupPermission && (
            <MenuItem key="Groups" href={`/${locale}/apps/group`} icon={<i className="tabler-users" />}>Groups</MenuItem>
          )}
          {permissArray?.isCompany && permissArray?.hasGroupPermission && (
            <MenuItem key="Certificate" href={`/${locale}/apps/certificate`} icon={<i className="tabler-certificate" />}>Certificate</MenuItem>
          )}
          {permissArray?.isCompany && (
            <MenuItem key="download_center" href={`/${locale}/apps/download-center`} icon={<i className="tabler-download" />}>Download center</MenuItem>
          )}
          {permissArray?.isCompany && (
            <MenuItem key="attendance" href={`/${locale}/apps/attendance`} icon={<i className="tabler-calendar" />}>
              Attendance
            </MenuItem>
          )}
          {permissArray?.isCompany && (
            <SubMenu label="Reports" icon={<i className="tabler-report" />}>
              <MenuItem key="completion_ratio_report" href={`/${locale}/apps/completion-ratio-report`}>Completion Ratio Report</MenuItem>
              <MenuItem key="quiz_assessment_report" href={`/${locale}/apps/quiz-assessment-report`}>Quiz Assessment Report</MenuItem>
              <MenuItem key="scorm_report" href={`/${locale}/apps/scorm-report`}>Scorm Report</MenuItem>
              <MenuItem key="login_report" href={`/${locale}/apps/login-report`}>Login Report</MenuItem>
              <MenuItem key="user_report" href={`/${locale}/apps/user-report`}>User Report</MenuItem>
              <MenuItem key="advance_training_report" href={`/${locale}/apps/advance-training-report`}>Advance Training Report</MenuItem>
              <MenuItem key="miscellaneous_report" href={`/${locale}/apps/miscellaneous-report`}>Miscellaneous Report</MenuItem>
            </SubMenu>
          )}
          {permissArray?.isSuperAdmin && (
            <MenuItem key="notification_listing" href={`/${locale}/apps/admin/notification`} icon={<i className="tabler-notification" />}>Notification</MenuItem>

          )}
          {
            permissArray?.isCompany && (
              <SubMenu label="Leadership & badges" icon={<i className="tabler-trophy" />}>

                <MenuItem href={`/${locale}/apps/admin/leaderboard`}>Leaderboard</MenuItem>
                <MenuItem href={`/${locale}/apps/admin/contest-badges`}>Contest & Badges</MenuItem>
              </SubMenu>
            )
          }
          {((permissArray?.isCompany && permissArray?.hasLabelPermission) || permissArray?.isSuperAdmin) && (
            <SubMenu label="Settings" icon={<i className="tabler-settings" />}>
              {permissArray?.isSuperAdmin && (
                [
                  <MenuItem key="language" href={`/${locale}/apps/language`}>Language</MenuItem>,
                  <MenuItem key="terminology" href={`/${locale}/apps/terminology`}>Terminology</MenuItem>,
                ]
              )}
              {permissArray?.isCompany && permissArray?.hasLabelPermission && (
                <MenuItem href={`/${locale}/apps/label`}>Label</MenuItem>
              )}
              {permissArray?.isCompany && (
                <MenuItem href={`/${locale}/apps/notification`}>Notification</MenuItem>
              )}
              {permissArray?.isCompany && (
                <MenuItem href={`/${locale}/apps/setting/certificate`}>Certificate</MenuItem>
              )}
            </SubMenu>
          )}
        </MenuSection>
      </Menu>
    </ScrollWrapper >
  )
}

export default VerticalMenu
