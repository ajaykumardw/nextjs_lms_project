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

  const { lang: locale } = useParams()

  const router = useRouter()

  const searchParams = useSearchParams();
  const activityId = searchParams.get('activityId');
  const types = searchParams.get('type');

  const moduleId = searchParams.get('moduleId')
  const contentFolderId = searchParams.get('contentFolderId')
  const moduleTypeId = searchParams.get('moduleTypeId')

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const ASSET_URL = process.env.NEXT_PUBLIC_ASSETS_URL;
  const { data: session } = useSession();
  const token = session?.user?.token;

  const [data, setData] = useState(null);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [fieldData, setFieldData] = useState({})

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

  const handleReportSave = async () => {
    try {
      const response = await fetch(
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

      const result = await response.json();

      if (response.ok) {
        router.push(`/${locale}/apps/content?id=${moduleId}&content-folder-id=${contentFolderId}`)
        toast.success("Activity completed successfully", { autoClose: 1000 });
      }

    } catch (error) {
      console.error("Save failed:", error);
      throw new Error(error);
    }
  };

  const handlePageChangeSave = async () => {
    try {
      const response = await fetch(
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

      const result = await response.json();

    } catch (error) {
      console.error("Save failed:", error);
      throw new Error(error);
    }
  };

  useEffect(() => {
    if (fieldData?.currentPage) {


      handlePageChangeSave();
    }
  }, [fieldData?.currentPage]);

  if (!types || !data) return null;

  const fileUrl = `${ASSET_URL}/activity/${data?.document_data?.image_url}`;
  const extension = data?.document_data?.image_url?.split('.').pop()?.toLowerCase();
  const isPDF = extension === 'pdf';
  const isOfficeDoc = ['ppt', 'pptx', 'doc', 'docx'].includes(extension);

  const handlePageChange = (current, total) => {
    if (current !== pageInfo.current || total !== pageInfo.total) {
      setPageInfo({ current, total });
    }
  };

  const moduleTypeLabel = {
    '688723af5dd97f4ccae68834': 'Documents & Slides',
    '688723af5dd97f4ccae68835': 'Video',
    '688723af5dd97f4ccae68836': 'YouTube Video',
    '688723af5dd97f4ccae68837': 'Scrom Content',
    '688723af5dd97f4ccae68838': 'Web Link',
    '688723af5dd97f4ccae68839': 'Subjective Assessment',
    '688723af5dd97f4ccae6883a': 'Flash Card',
    '68886902954c4d9dc7a379bd': 'Quiz',
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Card>
        <CardContent>
          {/* TITLE */}
          {loading ? (
            <Skeleton width="60%" height={40} />
          ) : (
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
              color="primary"
              sx={{ fontSize: { xs: '1.6rem', sm: '2rem' } }}
            >
              {data?.name || moduleTypeLabel?.[data?.module_type_id]}
            </Typography>
          )}



          {/* Page number */}
          {!loading && pageInfo.total > 0 && (isPDF || isOfficeDoc) && (
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500, mb: 1 }}>
              Page {pageInfo.current} of {pageInfo.total}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* CONTENT BOX */}
          <Box
            sx={{
              height: { xs: '45vh', sm: '50vh', md: '55vh' },  // smaller height
              p: { xs: 0.5, sm: 1 },
              border: '1px solid #eee',
              borderRadius: 2,
              overflow: 'auto',  // scroll inside
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
                  <PDFViewer pdfUrl={fileUrl} onPageChange={handlePageChange} setFieldData={setFieldData} pageData={data?.logs?.[0]} />
                )}

                {(extension === 'doc' || extension === 'docx') && (
                  <DocViewer fileUrl={fileUrl} onPageLoad={handlePageChange} setFieldData={setFieldData} pageData={data?.logs?.[0]} />
                )}

                {(extension === 'ppt' || extension === 'pptx') && (
                  <PptViewer fileUrl={fileUrl} onPageLoad={handlePageChange} setFieldData={setFieldData} pageData={data?.logs?.[0]} />
                )}

                {(types === 'youtube-video' || types === 'video') && (
                  <YouTubePlayerComponent
                    url={types === 'video' ? data?.video_url : data?.youtube_url}
                  />
                )}

                {types === 'quiz' && <QuizQuestionComponent data={data || {}} />}

                {types === 'scrom-content' && (
                  <ScromContentComponent url={data?.scrom_url || '/sample/coach/story.html'} />
                )}
              </>
            )}
          </Box>

          {/* BUTTONS */}
          {!loading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                mt: 3,
              }}
            >

              {fieldData?.viewedPages?.length == fieldData?.totalPages && (

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleReportSave()}
                >
                  Mark as complete
                </Button>

              )}
              <Button
                variant="outlined"
                color="secondary"
                href={`/${locale}/apps/content?id=${moduleId}&content-folder-id=${contentFolderId}`}
                onClick={() => console.log('Cancel Clicked')}
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
