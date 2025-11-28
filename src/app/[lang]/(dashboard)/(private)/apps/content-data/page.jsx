'use client';

import React, { useState, useEffect } from 'react';

import { useParams, useSearchParams, useRouter } from 'next/navigation';

import dynamic from 'next/dynamic';

import { useSession } from 'next-auth/react';
import { Box, Card, CardContent, Button, Typography, Divider, Skeleton } from '@mui/material';
import { toast } from 'react-toastify';

const PDFViewer = dynamic(() => import('@/components/Content-data/PdfViewer/index'), { ssr: false });
const DocViewer = dynamic(() => import('@/components/Content-data/DocViewer/index'), { ssr: false });
const PptViewer = dynamic(() => import('@/components/Content-data/PptViewer/index'), { ssr: false });
const YouTubePlayerComponent = dynamic(() => import('@/components/Content-data/youtube-player/page'), { ssr: false });
const QuizQuestionComponent = dynamic(() => import('@/components/Content-data/quiz-qyestion/page'), { ssr: false });
const ScromContentComponent = dynamic(() => import('@/components/Content-data/scrom-content/page'), { ssr: false });

const ContentData = () => {

  const { lang: locale } = useParams();
  const router = useRouter();

  const searchParams = useSearchParams();
  const activityId = searchParams.get('activityId');
  const types = searchParams.get('type');
  const moduleId = searchParams.get('moduleId');
  const contentFolderId = searchParams.get('contentFolderId');
  const moduleTypeId = searchParams.get('moduleTypeId');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const ASSET_URL = process.env.NEXT_PUBLIC_ASSETS_URL;
  const { data: session } = useSession();
  const token = session?.user?.token;

  const [data, setData] = useState(null);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [fieldData, setFieldData] = useState({});

  const fetchActivity = async () => {
    try {
      const response = await fetch(`${API_URL}/user/activity/fetch/data/${activityId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      
      if (response.ok) setData(result?.data);
      setLoading(false);
    } catch (error) {
      console.error('Activity Fetch Error:', error);
    }
  };

  useEffect(() => {
    if (API_URL && token && activityId) fetchActivity();
  }, [API_URL, token, activityId]);

  const saveFieldData = async () => {
    try {
      await fetch(
        `${API_URL}/user/activity/set/report/data/${moduleId}/${contentFolderId}/${activityId}/${moduleTypeId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fieldData),
        }
      );
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  // Auto save when page or video time changes
  useEffect(() => {
    if (fieldData?.currentPage || fieldData?.currentVideoTime) {
      saveFieldData();
    }
  }, [fieldData?.currentPage, fieldData?.currentVideoTime]);


  if (!types || !data) return null;

  const fileUrl = `${ASSET_URL}/activity/${data?.document_data?.image_url}`;
  const videoURL = `${ASSET_URL}/activity/${data?.video_data?.video_url}`;
  const youtubeVideoURL = `${data?.video_data?.video_url}`;
  const extension = data?.document_data?.image_url?.split('.').pop()?.toLowerCase();
  const isPDF = extension === 'pdf';
  const isOfficeDoc = ['ppt', 'pptx', 'doc', 'docx'].includes(extension);

  const handlePageChange = (current, total) => {
    if (current !== pageInfo.current || total !== pageInfo.total) {
      setPageInfo({ current, total });
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Card>
        <CardContent>

          {/* TITLE */}
          {loading ? (
            <Skeleton width="60%" height={40} />
          ) : (
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
              {data?.name}
            </Typography>
          )}

          {/* PAGE NUMBER */}
          {!loading && pageInfo.total > 0 && (isPDF || isOfficeDoc) && (
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500, mb: 1 }}>
              Page {pageInfo.current} of {pageInfo.total}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* CONTENT VIEWER */}
          <Box
            sx={{
              height: { xs: '45vh', sm: '50vh', md: '55vh' },
              p: { xs: 0.5, sm: 1 },
              border: '1px solid #eee',
              borderRadius: 2,
              overflow: 'auto',
            }}
          >

            {loading ? (
              <>
                <Skeleton height={200} />
                <Skeleton height={200} sx={{ mt: 2 }} />
              </>
            ) : (
              <>
                {types === 'pdf' && isPDF && (
                  <PDFViewer
                    pdfUrl={fileUrl}
                    onPageChange={handlePageChange}
                    setFieldData={setFieldData}
                    pageData={data?.logs?.[0]}
                  />
                )}

                {(extension === 'doc' || extension === 'docx') && (
                  <DocViewer
                    fileUrl={fileUrl}
                    onPageLoad={handlePageChange}
                    setFieldData={setFieldData}
                    pageData={data?.logs?.[0]}
                  />
                )}

                {(extension === 'ppt' || extension === 'pptx') && (
                  <PptViewer
                    fileUrl={fileUrl}
                    onPageLoad={handlePageChange}
                    setFieldData={setFieldData}
                    pageData={data?.logs?.[0]}
                  />
                )}

                {(types === 'video' || types === 'youtube-video') && (
                  <YouTubePlayerComponent
                    url={types === 'video' ? videoURL : youtubeVideoURL}
                    setFieldData={setFieldData}
                    pageData={data?.logs?.[0]}
                  />
                )}

                {types === 'quiz' && <QuizQuestionComponent data={data} />}
                {types === 'scrom-content' && <ScromContentComponent url={data?.scrom_url} />}
              </>
            )}
          </Box>

          {/* ACTION BUTTONS */}
          {!loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>

              {/* MARK AS COMPLETE BUTTON */}
              {(

                // Pages completed
                (fieldData?.viewedPages &&
                  fieldData?.totalPages &&
                  fieldData.viewedPages.length === fieldData.totalPages)

                ||

                // Video completed (rounded)
                (
                  fieldData?.totalVideoTime &&
                  fieldData?.viewedVideoTime &&
                  Number(fieldData.totalVideoTime) === Number(fieldData.viewedVideoTime)
                )
              ) && (
                  <Button variant="contained" color="primary" onClick={() => {
                    saveFieldData();
                    router.push(`/${locale}/apps/content?id=${moduleId}&content-folder-id=${contentFolderId}`);
                    toast.success("Activity completed successfully", { autoClose: 1000 });
                  }}>
                    Mark as complete
                  </Button>
                )}

              <Button
                variant="outlined"
                color="secondary"
                href={`/${locale}/apps/content?id=${moduleId}&content-folder-id=${contentFolderId}`}
              >
                Exit
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContentData;
