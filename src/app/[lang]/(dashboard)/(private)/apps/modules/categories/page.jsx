'use client'

// Component Imports

import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'

import CategoryLayout from '@/views/apps/category/CategoryLayout'

const CategoryApp = () => {

  return <CategoryLayout type="module" />
}

export default CategoryApp
