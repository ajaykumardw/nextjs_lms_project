'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Button,
  Typography,
  Divider,
  Skeleton
} from '@mui/material';
import { toast } from 'react-toastify';
import DialogCloseButton from '@/components/dialogs/DialogCloseButton';

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
  const [openConfirm, setOpenConfirm] = useState(false);

  const [fieldData, setFieldData] = useState({
    currentPage: 0,
    totalPages: 0,
    viewedPages: [],
    currentVideoTime: 0,
    viewedVideoTime: 0,
    totalVideoTime: 0
  });

  const [quizData, setQuizData] = useState([]);

  // refs for debounced autosave
  const fieldAutosaveTimer = useRef(null);
  const quizAutosaveTimer = useRef(null);

  /** FETCH ACTIVITY */
  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        if (!API_URL || !token || !activityId) return;
        const response = await fetch(`${API_URL}/user/activity/fetch/data/${activityId}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok) {
          setData(result?.data);
        } else {
          console.error('Activity Fetch Error response:', result);
        }
      } catch (error) {
        console.error('Activity Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [API_URL, token, activityId]);

  /** SAFE FETCH HELPERS */
  const postJson = async (url, payload) => {
    try {
      if (!API_URL || !token) {
        console.warn('Missing API_URL or token for postJson', { url });
        return { ok: false, error: 'missing credentials' };
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, data: json };
    } catch (error) {
      console.error('postJson error', error);
      return { ok: false, error };
    }
  };

  /** SAVE FUNCTIONS (set = update, insert = final/insert) */
  const saveFieldData = async (payload) => {
    const url = `${API_URL}/user/activity/set/report/data/${moduleId}/${contentFolderId}/${activityId}/${moduleTypeId}`;
    return postJson(url, payload);
  };

  const saveQuizData = async (payload) => {
    const url = `${API_URL}/user/activity/set/report/data/${moduleId}/${contentFolderId}/${activityId}/${moduleTypeId}`;
    return postJson(url, payload);
  };

  const saveInsertFieldData = async (payload) => {
    const url = `${API_URL}/user/activity/insert/report/data/${moduleId}/${contentFolderId}/${activityId}/${moduleTypeId}`;
    return postJson(url, payload);
  };

  const saveInsertQuizData = async (payload) => {
    const url = `${API_URL}/user/activity/insert/report/data/${moduleId}/${contentFolderId}/${activityId}/${moduleTypeId}`;
    return postJson(url, payload);
  };

  /** AUTOSAVE FIELD DATA — debounced to avoid API spam */
  useEffect(() => {
    // only trigger when meaningful values change
    const changed =
      fieldData.currentPage ||
      fieldData.currentVideoTime ||
      (fieldData.viewedPages && fieldData.viewedPages.length > 0);

    if (!changed) return;

    if (fieldAutosaveTimer.current) clearTimeout(fieldAutosaveTimer.current);

    fieldAutosaveTimer.current = setTimeout(() => {
      saveFieldData(fieldData).then((res) => {
        if (!res.ok) {
          console.warn('Field autosave failed', res);
        }
      });
    }, 1200); // 1.2s debounce

    return () => {
      if (fieldAutosaveTimer.current) {
        clearTimeout(fieldAutosaveTimer.current);
      }
    };
  }, [
    fieldData.currentPage,
    fieldData.currentVideoTime,
    (fieldData.viewedPages || []).length,
    fieldData.totalPages,
    fieldData.totalVideoTime,
    API_URL,
    token
  ]);

  /** AUTOSAVE QUIZ DATA — debounced */
  useEffect(() => {
    if (!Array.isArray(quizData) || quizData.length === 0) return;

    if (quizAutosaveTimer.current) clearTimeout(quizAutosaveTimer.current);

    quizAutosaveTimer.current = setTimeout(() => {
      saveQuizData(quizData).then((res) => {
        if (!res.ok) {
          console.warn('Quiz autosave failed', res);
        }
      });
    }, 1200);

    return () => {
      if (quizAutosaveTimer.current) clearTimeout(quizAutosaveTimer.current);
    };
  }, [quizData, API_URL, token]);

  /** FILE AND VIDEO INFO */
  const fileUrl = data?.document_data?.image_url ? `${ASSET_URL}/activity/${data.document_data.image_url}` : null;
  const videoURL = data?.video_data?.video_url ? `${ASSET_URL}/activity/${data.video_data.video_url}` : null;
  const youtubeVideoURL = data?.video_data?.video_url;
  const extension = data?.document_data?.image_url?.split('.').pop()?.toLowerCase();

  const isPDF = extension === 'pdf';
  const isOfficeDoc = ['ppt', 'pptx', 'doc', 'docx'].includes(extension);

  /** PAGE CHANGE HANDLER */
  const handlePageChange = (current, total) => {
    setPageInfo({ current, total });
    setFieldData(prev => ({
      ...prev,
      currentPage: current,
      totalPages: total,
      viewedPages: Array.from(new Set([...(prev.viewedPages || []), current]))
    }));
  };

  /** COMPLETION CHECK */
  const isCompletedCondition =
    (data?.logs?.[0]?.completion_percentage || 0) >= 100 || (
      (fieldData.totalPages > 0 && fieldData.viewedPages.length === fieldData.totalPages) ||
      (fieldData.totalVideoTime > 0 && fieldData.viewedVideoTime >= fieldData.totalVideoTime) ||
      (data?.questions?.length > 0 && quizData.length === data.questions.length)
    );

  /** MARK COMPLETE — uses insert endpoints */
  const handleMarkComplete = async () => {
    setOpenConfirm(false);

    try {
      if (quizData.length > 0) {
        const res = await saveInsertQuizData(quizData);
        if (!res.ok) {
          toast.error('Failed to save quiz before marking complete');
          console.warn('markComplete saveInsertQuizData failed', res);
        }
      } else {
        const res = await saveInsertFieldData(fieldData);
        if (!res.ok) {
          toast.error('Failed to save progress before marking complete');
          console.warn('markComplete saveInsertFieldData failed', res);
        }
      }

      toast.success('Activity completed successfully', { autoClose: 1000 });
      router.push(`/${locale}/apps/content?id=${moduleId}&content-folder-id=${contentFolderId}`);
    } catch (err) {
      console.error('handleMarkComplete error', err);
      toast.error('Could not mark activity complete');
    }
  };

  /** RENDER */
  const ready = types && data;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {!ready ? (
        <Skeleton height={200} />
      ) : (
        <Card>
          <CardContent>
            {loading ? (
              <Skeleton width="60%" height={40} />
            ) : (
              <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                {data.name}
              </Typography>
            )}

            {!loading && pageInfo.total > 0 && (isPDF || isOfficeDoc) && (
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500, mb: 1 }}>
                Page {pageInfo.current} of {pageInfo.total}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                height: { xs: '45vh', sm: '50vh', md: '55vh' },
                p: { xs: 0.5, sm: 1 },
                border: '1px solid #eee',
                borderRadius: 2,
                overflow: 'auto'
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
                    <PDFViewer pdfUrl={fileUrl} onPageChange={handlePageChange} setFieldData={setFieldData} pageData={data.logs?.[0]} />
                  )}
                  {(extension === 'doc' || extension === 'docx') && (
                    <DocViewer fileUrl={fileUrl} onPageLoad={handlePageChange} setFieldData={setFieldData} pageData={data.logs?.[0]} />
                  )}
                  {(extension === 'ppt' || extension === 'pptx') && (
                    <PptViewer fileUrl={fileUrl} onPageLoad={handlePageChange} setFieldData={setFieldData} pageData={data.logs?.[0]} />
                  )}
                  {(types === 'video' || types === 'youtube-video') && (
                    <YouTubePlayerComponent url={types === 'video' ? videoURL : youtubeVideoURL} setFieldData={setFieldData} pageData={data.logs?.[0]} />
                  )}
                  {types === 'quiz' && (
                    <QuizQuestionComponent
                      status={data?.logs?.[0]?.is_completed}
                      data={data.questions || []}
                      report={data.quiz_reports || []}
                      setQuizData={setQuizData}
                      saveInsertQuizData={saveInsertQuizData} // pass actual fn
                    />
                  )}
                  {types === 'scrom-content' && <ScromContentComponent url={data.scrom_url} />}
                </>
              )}
            </Box>

            {!loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                {types !== 'quiz' && isCompletedCondition && (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={data.logs?.[0]?.is_completed}
                    onClick={() => setOpenConfirm(true)}
                  >
                    Mark as complete
                  </Button>
                )}

                <Button variant="outlined" color="secondary" href={`/${locale}/apps/content?id=${moduleId}&content-folder-id=${contentFolderId}`}>
                  Exit
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}>
        <DialogCloseButton onClick={() => setOpenConfirm(false)}><i className="tabler-x" /></DialogCloseButton>
        <DialogTitle>Confirm Completion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this activity as complete?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="secondary">Cancel</Button>
          <Button onClick={handleMarkComplete} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentData;
  