'use client';

import React, { useState, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import dynamic from 'next/dynamic';

import { useSession } from 'next-auth/react';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Skeleton,
} from '@mui/material';

// Dynamic components
const PDFViewer = dynamic(
  () => import('@/components/Content-data/PdfViewer/index'),
  { ssr: false }
);

const DocViewer = dynamic(
  () => import('@/components/Content-data/DocViewer/index'),
  { ssr: false }
);

const PptViewer = dynamic(
  () => import('@/components/Content-data/PptViewer/index'),
  { ssr: false }
);

const YouTubePlayerComponent = dynamic(
  () => import('@/components/Content-data/youtube-player/page'),
  { ssr: false }
);

const QuizQuestionComponent = dynamic(
  () => import('@/components/Content-data/quiz-qyestion/page'),
  { ssr: false }
);

const ScromContentComponent = dynamic(
  () => import('@/components/Content-data/scrom-content/page'),
  { ssr: false }
);

const ContentData = () => {
  const searchParams = useSearchParams();
  const activityId = searchParams.get('activityId');
  const types = searchParams.get('type');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const ASSET_URL = process.env.NEXT_PUBLIC_ASSETS_URL;

  const { data: session } = useSession();
  const token = session?.user?.token;

  const [data, setData] = useState(null);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch activity details
  const fetchActivity = async () => {
    try {
      const response = await fetch(
        `${API_URL}/user/activity/fetch/data/${activityId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();

      if (response.ok) setData(result?.data);
      setLoading(false)
    } catch (error) {
      console.error('Activity Fetch Error:', error);
    }
  };

  useEffect(() => {
    if (API_URL && token && activityId) fetchActivity();
  }, [API_URL, token, activityId]);

  if (!types) return null;

  const fileUrl = `${ASSET_URL}/activity/${data?.document_data?.image_url}`;

  const extension = data?.document_data?.image_url
    ?.split('.')
    ?.pop()
    ?.toLowerCase();

  const handlePageChange = (current, total) => {
    setPageInfo({ current, total });
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

  const isPDF = extension === 'pdf';

  const isOfficeDoc =
    ['ppt', 'pptx', 'doc', 'docx'].includes(extension);

    console.log("Extension", extension);


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
              {moduleTypeLabel?.[data?.module_type_id] ||
                'Content Module'}
            </Typography>
          )}

          {/* PDF Page number */}
          {types === 'pdf' &&
            pageInfo.total > 0 &&
            !loading && (
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                Page {pageInfo.current} of {pageInfo.total}
              </Typography>
            )}

          <Divider sx={{ my: 2 }} />

          {/* CONTENT AREA */}
          <Box
            sx={{
              height: { xs: '60vh', sm: '70vh', md: '80vh' },
              p: { xs: 0.5, sm: 1 },
              border: '1px solid #eee',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {loading && (
              <Box>
                <Skeleton height={200} />
                <Skeleton height={200} sx={{ mt: 2 }} />
              </Box>
            )}

            {!loading && (
              <>
                {/* DOCUMENT VIEWING */}
                {types === 'pdf' && (
                  <>
                    {isPDF && (
                      <PDFViewer
                        pdfUrl={fileUrl}
                        onPageChange={handlePageChange}
                      />
                    )}

                    {(extension === "doc" || extension === "docx") && (
                      <DocViewer
                        fileUrl={fileUrl}
                        onPageLoad={handlePageChange}
                      />
                    )}

                    {(extension === "ppt" || extension === "pptx") && (
                      <PptViewer
                        fileUrl={fileUrl}
                        onPageLoad={handlePageChange}
                      />
                    )}
                  </>
                )}

                {/* VIDEO / YOUTUBE */}
                {(types === 'youtube-video' || types === 'video') && (
                  <YouTubePlayerComponent
                    url={
                      types === 'video'
                        ? data?.video_url
                        : data?.youtube_url
                    }
                  />
                )}

                {/* QUIZ */}
                {types === 'quiz' && (
                  <QuizQuestionComponent data={data || {}} />
                )}

                {/* SCORM */}
                {types === 'scrom-content' && (
                  <ScromContentComponent
                    url={
                      data?.scrom_url ||
                      '/sample/coach/story.html'
                    }
                  />
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContentData;
