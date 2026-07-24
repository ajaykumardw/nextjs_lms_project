'use client'

// -------------------- React Imports --------------------
import { useEffect, useState, useMemo } from 'react';

// -------------------- Next.js Imports --------------------
import { useRouter, useParams } from 'next/navigation';

// -------------------- MUI Imports --------------------
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import TablePagination from '@mui/material/TablePagination';
import MenuItem from '@mui/material/MenuItem';
import { Chip } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

// -------------------- External Libraries --------------------
import { toast } from 'react-toastify';
import classnames from 'classnames';

// -------------------- React Table Imports --------------------
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel
} from '@tanstack/react-table';

// -------------------- Dialog & View Components --------------------
import UpdatePasswordDialog from '@components/dialogs/user/update-password-dialog/page';
import DeleteUserDialog from '@components/dialogs/user/delete-user-dialog/page';
import ManageEmpCodeDialog from '@/components/dialogs/user/manage-emp-code-dialog/index';
import ImportUsers from '../../../../views/apps/user/import/ImportUsers';

// -------------------- Local/Custom Components --------------------
import OptionMenu from '@core/components/option-menu';
import TablePaginationComponent from '@components/TablePaginationComponent';
import CustomTextField from '@core/components/mui/TextField';
import CustomAvatar from '@core/components/mui/Avatar';

// -------------------- Utilities --------------------
import { getInitials } from '@/utils/getInitials';
import { useApi } from '../../../../utils/api';

// -------------------- Styles --------------------
import tableStyles from '@core/styles/table.module.css';

import { usePermissionList } from '@/utils/getPermission';

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper()

const UserListTable = ({
  userData,
  totalUsers,
  page,
  pageSize,
  search,
  setSearch,
  setPage,
  setPageSize,
  loadData,
  setIsUserCardShow,
  getStatsCount
}) => {

  // States
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openManageEmpCodeDialog, setManageEmpCodeDialog] = useState(false)
  const [openImportWindow, setOpenImportWindow] = useState(false)
  const [user, setUser] = useState()
  const { doPostFormData } = useApi();
  const public_url = process.env.NEXT_PUBLIC_ASSETS_URL;

  const router = useRouter();

  const getPermissions = usePermissionList();
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const result = await getPermissions();

        setPermissions(result);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    if (getPermissions) {
      fetchPermissions();
    }
  }, [getPermissions]); // Include in dependency array

  const updateNewPasswordhandle = (row) => {
    setUser(row);
    setOpen(true);
  }

  const handleManageEmpDialog = (row) => {
    setUser(row);
    setManageEmpCodeDialog(true);
  }

  const openDeleteDialogHandle = (row) => {
    setUser(row);
    setOpenDeleteDialog(true)
  }

  const handleImportDialog = (row) => {
    setOpenImportWindow(true)
    setIsUserCardShow(false)
  }

  const onBack = () => {
    setOpenImportWindow(false);
    setIsUserCardShow(true)
    loadData();
    getStatsCount();
  }

  const handleStatusChange = async (userId, status) => {
    const endpoint = `admin/user/status/update/${userId}`;

    await doPostFormData({
      endpoint,
      values: { status: status },
      method: 'PUT',
      onSuccess: (response) => {
        toast.success(response.message, { autoClose: 2000 });
        getStatsCount();
      },
      onError: (error) => {

      }
    });
  };

  // Hooks
  const { lang: locale } = useParams()

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('first_name', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {getAvatar({ avatar: row.original.photo, fullName: row.original.first_name + " " + row.original.last_name })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.first_name + " " + row.original.last_name}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),

      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => <Typography>{row.original.phone}</Typography>
      }),

      columnHelper.accessor('roles', {
        header: 'Role',
        cell: ({ row }) => {
          const roles = row.original?.roles || []

          const roleNames = roles
            .map(role => role?.role_id?.name)
            .filter(Boolean)
            .join(', ')

          return (
            <Chip
              label={roleNames || '-'}
              size="small"
              variant="tonal"
            />
          )
        }
      }),
      columnHelper.accessor('participation_type', {
        header: 'Participation Type',
        cell: ({ row }) => <Typography>{row.original.participation_type_id.name}</Typography>
      }),

      columnHelper.accessor('reporting_manager', {
        header: 'Reporting Manager',
        cell: ({ row }) => <Typography>{row?.original?.reporting_manager_id?.first_name} {row?.original?.reporting_manager_id?.last_name}</Typography>
      }),
      columnHelper.accessor('emp_id', {
        header: 'Employee ID',
        cell: ({ row }) => <Typography>{row.original.emp_id}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(row.original.status)}
                  color='success'
                  onChange={e => {
                    handleStatusChange(
                      row.original._id,
                      e.target.checked
                    )
                  }}
                  size='medium'
                />
              }
            />
          </div>
        )
      }),
      columnHelper.display({
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                permissions?.hasUserEditPermission && {
                  text: 'Edit account',
                  icon: 'tabler-edit',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {
                      router.push(`/${locale}/apps/user/form/${row.original._id}`)
                    }
                  }
                },
                {
                  text: 'Update password',
                  icon: 'tabler-lock',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {
                      updateNewPasswordhandle(row.original)
                    }
                  }
                },
                {
                  text: 'Manage employee ID',
                  icon: 'tabler-user',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {
                      handleManageEmpDialog(row.original)
                    }
                  }
                },
                {
                  text: 'Delete account',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {
                      openDeleteDialogHandle(row.original)
                    }
                  }
                }
              ].filter(Boolean)}
            />
          </div>
        ),
        enableSorting: false
      })

    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissions]
  )

  const table = useReactTable({
    data: userData,
    columns,

    state: {
      rowSelection
    },

    enableRowSelection: true,

    onRowSelectionChange: setRowSelection,

    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getFacetedRowModel: getFacetedRowModel(),

    getFacetedUniqueValues: getFacetedUniqueValues(),

    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const getAvatar = params => {
    const { avatar, fullName } = params

    if (avatar) {
      return <CustomAvatar src={`${public_url}/${avatar}`} size={34} />
    } else {
      return <CustomAvatar size={34}>{getInitials(fullName)}</CustomAvatar>
    }
  }

  return (
    <>
      {openImportWindow ? (
        <ImportUsers batch={[]} onBack={onBack} userData={userData} />
      ) : (
        <Card >
          {/* <CardHeader title='Filters' className='pbe-4' /> */}
          {/* <TableFilters setData={setFilteredData} tableData={data} /> */}
          <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
            <CustomTextField
              select
              value={pageSize}
              onChange={e => {
                const newPageSize = Number(e.target.value)

                setPageSize(newPageSize)
                setPage(0)
              }}
              className='max-sm:is-full sm:is-[70px]'
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </CustomTextField>
            <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
              <DebouncedInput
                value={search}
                onChange={value => {
                  setSearch(String(value))
                  setPage(0)
                }}
                placeholder='Search User'
                className='max-sm:is-full'
              />
              {permissions && permissions?.['hasUserImportPermission'] && (
                <Button
                  variant='tonal'
                  startIcon={<i className='tabler-upload' />}
                  className='max-sm:is-full'
                  onClick={() => handleImportDialog()}
                >
                  Import
                </Button>
              )}

              {permissions && permissions['hasUserAddPermission'] && (
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(`/${locale}/apps/user/form`)}
                  className='max-sm:is-full'
                >
                  Add New User
                </Button>
              )}

            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              className={classnames({
                                'flex items-center': header.column.getIsSorted(),
                                'cursor-pointer select-none': header.column.getCanSort()
                              })}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <i className='tabler-chevron-up text-xl' />,
                                desc: <i className='tabler-chevron-down text-xl' />
                              }[header.column.getIsSorted()] ?? null}
                            </div>
                          </>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table
                    .getRowModel()
                    .rows
                    .map(row => {
                      return (
                        <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                </tbody>
              )}
            </table>
          </div>
          <TablePagination
            component='div'
            count={totalUsers}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, newPage) => {
              setPage(newPage)
            }}
            onRowsPerPageChange={event => {
              const newPageSize = parseInt(event.target.value, 10)

              setPageSize(newPageSize)
              setPage(0)
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
          <UpdatePasswordDialog open={open} setOpen={setOpen} data={user} />
          <DeleteUserDialog open={openDeleteDialog} setOpen={setOpenDeleteDialog} type='delete-account' user={user} loadData={loadData} />
          <ManageEmpCodeDialog open={openManageEmpCodeDialog} setOpen={setManageEmpCodeDialog} user={user} loadData={loadData} />
        </Card>
      )}
    </>
  )
}

export default UserListTable
