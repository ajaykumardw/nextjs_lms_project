'use client'

import { useRouter, useParams } from "next/navigation"

import ContestBadgeForm from "@/components/dialogs/contest-badge-dialog/page"

const ContestBadgeEditForm = () => {

    const { id } = useParams();

    return (
        <>
            <ContestBadgeForm isEdit={true} id={id} />
        </>
    )

}

export default ContestBadgeEditForm;
