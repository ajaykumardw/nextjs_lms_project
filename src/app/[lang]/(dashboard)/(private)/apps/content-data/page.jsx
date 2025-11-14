'use client';

import React, { useState, useEffect } from "react";

import { useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
} from "@mui/material";


// ✅ Import PDFViewer dynamically (no SSR)
const PDFViewer = dynamic(() => import("@/components/Content-data/PdfViewer/index"), { ssr: false });

import YouTubePlayerComponent from "@/components/Content-data/youtube-player/page";

import QuizQuestionComponent from "@/components/Content-data/quiz-qyestion/page";

const ContentData = () => {

  const ASSET_URL = process.env.NEXT_PUBLIC_ASSETS_URL

  const searchParams = useSearchParams()
  const [types, setTypes] = useState(null)
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 0 });

  // Ensure params load on client only
  useEffect(() => {
    setTypes(searchParams.get("type"))
  }, [searchParams])

  if (!types) return null  // Prevent SSR mismatch

  const pdfUrl = `${ASSET_URL}/activity/1753943817117-DWE_AML.pdf`;

  const videoUrl = `${ASSET_URL}/sample/sample_video.mp4`;

  const youtubeUrl = `https://www.youtube.com/watch?v=Lt1HGm6dWUw`

  const handlePageChange = (current, total) => {
    setPageInfo({ current, total });
  };

  return (
    <Box>
      <Card>
        <CardContent>
          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
            color="primary"
          >
            3.1 HR One Attendance Guidelines
          </Typography>

          <Typography
            variant="h6"
            component="h2"
            fontWeight="600"
            gutterBottom
          >
            Policy Document
          </Typography>

          {/* ✅ Page number directly below Policy Document */}
          {types == "pdf" && pageInfo.total > 0 && (
            <Typography
              variant="body2"
              sx={{
                color: "primary.main",
                fontWeight: 500,
                mb: 1,
              }}
            >
              Page {pageInfo.current} of {pageInfo.total}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* PDF Viewer */}
          <Box sx={{ height: "80vh", p: 1, border: "1px solid #eee", borderRadius: 2 }}>
            {
              types == "pdf" && (

                <PDFViewer pdfUrl={pdfUrl} onPageChange={handlePageChange} />

              )
            }

            {(types == "youtube-video" || types == "video") && (
              <YouTubePlayerComponent url={types == "video" ? videoUrl : youtubeUrl} />
            )}

            {types == "quiz" && (
              <QuizQuestionComponent data={{}} />
            )}

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContentData;
