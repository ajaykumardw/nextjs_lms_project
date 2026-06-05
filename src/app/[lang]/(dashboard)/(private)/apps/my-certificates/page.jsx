'use client'

import { useState, useEffect } from 'react'

import { useParams } from "next/navigation"

import { useSession } from 'next-auth/react';

import CertificateCard from "@/components/certificateCard";

import PermissionGuard from "@/hocs/PermissionClientGuard";

const MyCertificate = () => {

    const { lang: lang } = useParams();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const { data: session } = useSession();
    const token = session?.user?.token;

    const [certificateData, setCertificateData] = useState()

    const fetchCertificateData = async () => {
        try {

            const response = await fetch(`${API_URL}/user/certificate/fetch/data`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const result = await response.json();

            if (response.ok) {

                const value = result?.data;

                console.log("Value", value);


                setCertificateData(value)

            }

        } catch (error) {

            throw new Error(error)
        }
    }

    useEffect(() => {

        if (API_URL && token) {

            fetchCertificateData();
        }
    }, [API_URL, token])

    return (
        <>
            <PermissionGuard locale={lang} element={'isUser'}>
                <CertificateCard searchValue={certificateData} userName={session?.user?.name} />
            </PermissionGuard>
        </>
    )

}

export default MyCertificate
