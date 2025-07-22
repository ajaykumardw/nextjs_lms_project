"use client"

import { useState, useEffect } from 'react'

// Util Imports
import { useRouter, useParams, useSearchParams } from 'next/navigation'

import { getLocalizedUrl } from '@/utils/i18n'

import TrainingFormLayout from './training-form-layout';


const ModuleLayout = props => {
    const [layoutType, setLayoutType] = useState('');
    const { lang: locale, id: id } = useParams()

    useEffect(() => {
        if (id) {
            setLayoutType('micro-modules');
        }

    }, [id])

    return (
        <>
            <TrainingFormLayout setLayoutType={setLayoutType} />
        </>
    )
}

export default ModuleLayout
