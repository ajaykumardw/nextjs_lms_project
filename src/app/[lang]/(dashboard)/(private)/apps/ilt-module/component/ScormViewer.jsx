"use client";

import { useEffect, useRef, useState } from "react";

import {
    Box,
    CircularProgress,
    Typography
} from "@mui/material";

// -------------------------------------------------
// Inject SCORM APIs (1.2 + 2004)
// -------------------------------------------------
function injectScormAPI(setProgress, setScormData) {
    if (typeof window === "undefined") return;

    // Don't recreate the APIs on every render/mount
    if (window.API_1484_11 || window.API) return;

    const store2004 = {};
    const store12 = {};

    // -----------------------------
    // SCORM 2004
    // -----------------------------
    window.API_1484_11 = {
        Initialize: () => "true",

        Terminate: () => {
            setScormData((prev) => ({
                ...(prev || {}),
                ...store2004,
            }));

            return "true";
        },

        GetValue: (key) => {
            return store2004[key] ?? "";
        },

        SetValue: (key, value) => {
            store2004[key] = value;

            if (key === "cmi.location") {
                setProgress((prev) => ({
                    ...prev,
                    slide: value,
                    currentTime: Number(store2004.currentTime || 0),
                }));

                setScormData((prev) => ({
                    ...(prev || {}),
                    ...store2004,
                }));
            }

            return "true";
        },

        Commit: () => {
            setScormData((prev) => ({
                ...(prev || {}),
                ...store2004,
            }));

            return "true";
        },

        GetLastError: () => "0",
        GetErrorString: () => "",
        GetDiagnostic: () => "",
    };

    // -----------------------------
    // SCORM 1.2
    // -----------------------------
    window.API = {
        LMSInitialize: () => "true",

        LMSFinish: () => {
            setScormData((prev) => ({
                ...(prev || {}),
                ...store12,
            }));

            return "true";
        },

        LMSGetValue: (key) => {
            return store12[key] ?? "";
        },

        LMSSetValue: (key, value) => {
            store12[key] = value;

            if (key === "cmi.core.lesson_location") {
                setProgress((prev) => ({
                    ...prev,
                    slide: value,
                    currentTime: Number(store12.currentTime || 0),
                }));

                setScormData((prev) => ({
                    ...(prev || {}),
                    ...store12,
                }));
            }

            return "true";
        },

        LMSCommit: () => {
            setScormData((prev) => ({
                ...(prev || {}),
                ...store12,
            }));

            return "true";
        },

        LMSGetLastError: () => "0",
        LMSGetErrorString: () => "",
        LMSGetDiagnostic: () => "",
    };
}

// -------------------------------------------------
// Inject progress tracker into iframe
// -------------------------------------------------
function injectTrackingScript(iframe) {
    if (!iframe?.contentWindow || !iframe?.contentDocument) return;

    const document = iframe.contentDocument;

    // Avoid injecting multiple times
    if (document.getElementById("scorm-progress-tracker")) return;

    const script = document.createElement("script");

    script.id = "scorm-progress-tracker";
    script.type = "text/javascript";

    script.innerHTML = `
        (function () {
            let lastSlide = null;
            let lastTime = 0;

            function getScormValue() {
                try {
                    const api2004 = window.parent?.API_1484_11;
                    const api12 = window.parent?.API;

                    const slide =
                        api2004?.GetValue?.("cmi.location") ||
                        api12?.LMSGetValue?.("cmi.core.lesson_location") ||
                        null;

                    return {
                        slide,
                        api2004,
                        api12
                    };
                } catch (e) {
                    return {
                        slide: null,
                        api2004: null,
                        api12: null
                    };
                }
            }

            function trackProgress() {
                try {
                    const scorm = getScormValue();

                    const video = document.querySelector("video");

                    const currentTime = video
                        ? Number(video.currentTime || 0)
                        : 0;

                    const slideChanged = scorm.slide !== lastSlide;
                    const timeChanged =
                        Math.abs(currentTime - lastTime) >= 5;

                    if (slideChanged || timeChanged) {
                        lastSlide = scorm.slide;
                        lastTime = currentTime;

                        window.parent.postMessage(
                            {
                                type: "SCORM_PROGRESS",
                                progress: {
                                    slide: scorm.slide,
                                    currentTime
                                }
                            },
                            "*"
                        );
                    }
                } catch (e) {
                    // Ignore tracking errors
                }
            }

            setInterval(trackProgress, 1000);

            // Initial progress
            trackProgress();
        })();
    `;

    if (document.body) {
        document.body.appendChild(script);
    }
}

// -------------------------------------------------
// React Component
// -------------------------------------------------
export default function ScormViewer({
    data,
    setScormData,
    scromLogData
}) {
    const [launchFile, setLaunchFile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [progress, setProgress] = useState({
        slide: scromLogData?.lastSlide || null,
        currentTime: Number(scromLogData?.lastTime || 0),
    });

    const saveTimeout = useRef(null);

    // -------------------------------------------------
    // Inject SCORM API
    // -------------------------------------------------
    useEffect(() => {
        injectScormAPI(setProgress, setScormData);

        return () => {
            if (saveTimeout.current) {
                clearTimeout(saveTimeout.current);
            }
        };
    }, [setProgress, setScormData]);

    // -------------------------------------------------
    // Load SCORM manifest
    // -------------------------------------------------
    useEffect(() => {
        if (!data?.scorm_data?.folder_url) {
            setLaunchFile(null);
            setLoading(false);
            
            return;
        }

        const folderUrl = data.scorm_data.folder_url;
        
        const manifestUrl =
            `/api/scorm/${folderUrl}/imsmanifest.xml`;

        async function loadManifest() {
            try {
                setLoading(true);
                setLaunchFile(null);

                const res = await fetch(manifestUrl);

                if (!res.ok) {
                    throw new Error(
                        `Unable to load SCORM manifest: ${res.status}`
                    );
                }

                const xmlText = await res.text();

                const xml = new DOMParser().parseFromString(
                    xmlText,
                    "application/xml"
                );

                const item = xml.querySelector("item");

                if (!item) {
                    throw new Error(
                        "SCORM item not found in manifest"
                    );
                }

                const identifierRef =
                    item.getAttribute("identifierref");

                const resource = identifierRef
                    ? xml.querySelector(
                        `resource[identifier="${identifierRef}"]`
                    )
                    : null;

                const href =
                    resource?.getAttribute("href") ||
                    resource
                        ?.querySelector("file")
                        ?.getAttribute("href");

                if (!href) {
                    throw new Error(
                        "SCORM launch file not found in manifest"
                    );
                }

                setLaunchFile(
                    `/api/scorm/${folderUrl}/${href}`
                );
            } catch (err) {
                console.error(
                    "Manifest load error:",
                    err
                );

                setLaunchFile(null);
            } finally {
                setLoading(false);
            }
        }

        loadManifest();
    }, [data]);

    // -------------------------------------------------
    // Listen for progress messages
    // -------------------------------------------------
    useEffect(() => {
        const listener = (event) => {
            if (event.data?.type !== "SCORM_PROGRESS") {
                return;
            }

            const p = event.data.progress || {};

            const numericTime =
                Number(p.currentTime || 0);

            const progressData = {
                slide: p.slide ?? null,
                currentTime: numericTime,
            };

            setProgress(progressData);

            setScormData((prev) => ({
                ...(prev || {}),
                lastSlide: p.slide ?? null,
                lastTime: numericTime,
            }));

            // Debounced API save
            if (saveTimeout.current) {
                clearTimeout(saveTimeout.current);
            }
        };

        window.addEventListener(
            "message",
            listener
        );

        return () => {
            window.removeEventListener(
                "message",
                listener
            );

            if (saveTimeout.current) {
                clearTimeout(saveTimeout.current);
            }
        };
    }, [setScormData]);

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                minHeight: 0,
                position: "relative",
                overflow: "hidden",
                bgcolor: "#f5f6f8",
                borderRadius: 1.5,
            }}
        >
            {launchFile ? (
                <iframe
                    src={launchFile}
                    title="SCORM Content"
                    style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "620px",
                        display: "block",
                        border: "none",
                        background: "#fff",
                    }}
                    allow="autoplay; fullscreen; same-origin"
                    allowFullScreen
                    onLoad={(e) => {
                        injectTrackingScript(
                            e.currentTarget
                        );
                    }}
                />
            ) : (
                <Box
                    sx={{
                        width: "100%",
                        minHeight: 620,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        bgcolor: "background.paper",
                    }}
                >
                    {loading ? (
                        <>
                            <CircularProgress
                                size={34}
                                thickness={4}
                            />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Loading SCORM content...
                            </Typography>
                        </>
                    ) : (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Unable to load SCORM content.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}
