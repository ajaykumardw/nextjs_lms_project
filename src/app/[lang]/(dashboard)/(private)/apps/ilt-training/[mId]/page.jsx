"use client";

import React, { useState, useEffect } from "react";

import { useParams } from "next/navigation"

import { useSession } from "next-auth/react"

import {
    Box,
    Tab,
    Card,
    CardContent,
} from "@mui/material";

import { TabContext, TabList, TabPanel } from "@mui/lab";

import ConfigurePanel from "./TabPanelComponent/ConfigurePanel";
import InvitePanel from "./TabPanelComponent/InvitePanel";
import EngagePanel from "./TabPanelComponent/EngagePanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ILTPageComponent = () => {

    const [value, setValue] = useState("configure");
    const handleTabChange = (e, newValue) => setValue(newValue);

    const { mId } = useParams();

    const { data: session } = useSession();
    const token = session?.user?.token;

    const [certificateData, setCertificateData] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [activityData, setActivityData] = useState()
    const [finalData, setFinalData] = useState()

    const [pageLoading, setPageLoading] = useState(true);

    const [createData, setCreateData] = useState({
        designation: [],
        department: [],
        group: [],
        region: [],
        user: [],
    });

    const handleFetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/company/ILT/data/${mId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await response.json();

            if (response.ok) {

                const value = result?.data;

                setFinalData(value)

                const questionData = value?.moduleSurvey;

                setCertificateData(value?.certificate || []);
                setQuestions(
                    questionData?.length
                        ? questionData?.map((q) => ({
                            id: Date.now() + Math.random(),
                            text: q.question || "",
                            options: q.options || [],
                            multiOption: q.multiOption || false,
                            type: q.questionsType || "",
                            mandatory: q.mandatory || false,
                            errors: { text: false, type: false },
                        }))
                        : []
                );
                
                const create_data = {
                    designation: value?.designation || [],
                    department: value?.department || [],
                    group: value?.group || [],
                    region: value?.region || [],
                    user: value?.user || [],
                };

                setCreateData(create_data);
                setActivityData(value?.appConfig)
            }
        } catch (error) {
            console.error(error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (API_URL && token) {

            handleFetchData();
        }
    }, [API_URL, token]);

    const canManageLearners = !finalData?.finalSchedule?.moduleSetting?.trainerAllowed || true; // see note above — wire real role check here

    return (
        <Card>
            <CardContent>
                <TabContext value={value}>
                    <TabList
                        variant="scrollable"
                        onChange={handleTabChange}
                        className="border-b px-0 pt-0"
                    >
                        <Tab key={1} label="Configure" value="configure" />
                        <Tab key={2} label="Invite" value="invite" />
                        <Tab key={3} label="Engage" value="engage" />
                    </TabList>

                    <Box mt={3}>
                        <TabPanel value="configure" className="p-0">
                            <ConfigurePanel
                                token={token}
                                handleFetchData={handleFetchData}
                                setQuestions={setQuestions}
                                questions={questions}
                                mId={mId}
                                createData={createData}
                                certificateData={certificateData}
                                loading={pageLoading}
                                finalData={finalData}
                                finalScheduleData={finalData?.finalSchedule}
                            />
                        </TabPanel>
                        <TabPanel value="invite" className="p-0">
                            <InvitePanel
                                loading={pageLoading}
                                mId={mId}
                                setValue={setValue}
                                token={token}
                                handleFetchData={handleFetchData}
                                finalData={finalData}
                                activityData={activityData}
                                users={createData.user}
                                canManage={canManageLearners}
                            />
                        </TabPanel>
                        <TabPanel value="engage" className="p-0">
                            <EngagePanel
                                activityData={activityData}
                                token={token}
                                fetchActivities={handleFetchData}
                                loading={pageLoading}
                                mId={mId}
                                finalData={finalData}
                            />
                        </TabPanel>
                    </Box>
                </TabContext>
            </CardContent>
        </Card>
    );
};

export default ILTPageComponent;
