'use client'

import { useEffect, useState } from "react"

import CertificateCard from "@/components/certificateCard";

const certificateData = [
    {
        issued_by: "DW",
        issued_on: "JUL 3rd 2024",
        valid_till: "_",
        certificate_type: "Internal",
        certificate_url: ""
    },
    {
        issued_by: "DW",
        issued_on: "JUL 3rd 2024",
        valid_till: "_",
        certificate_type: "Internal",
        certificate_url: ""
    },
    {
        issued_by: "DW",
        issued_on: "JUL 3rd 2024",
        valid_till: "_",
        certificate_type: "Internal",
        certificate_url: ""
    },
    {
        issued_by: "DW",
        issued_on: "JUL 3rd 2024",
        valid_till: "_",
        certificate_type: "Internal",
        certificate_url: ""
    }
];

const MyCertificate = () => {

    return (
        <>
            <CertificateCard searchValue={certificateData} />
        </>
    )

}

export default MyCertificate
