'use client'; // This ensures the component runs on the client side

import React, { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import { Card, CardHeader, CardContent, Typography, Button, CardActions, Divider } from "@mui/material";

import Grid from "@mui/material/Grid2";

import { format } from 'date-fns';

import { getLocalizedUrl } from "@/utils/i18n";
import DefaultExamInstructions from '@/components/QuizInstruction/page';

const ExamTest = () => {
  const { lang: locale } = useParams();
  const [examSet, setExamSet] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [studentExamResults, setStudentExamResults] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [isClient, setIsClient] = useState(false);

  const mockData = {
    batch: {
      id: 1,
      batch_name: "React Batch 2026",
      login_restrict: 3,

      assessment_start_datetime: new Date("2026-06-29T09:00:00"),
      assessment_end_datetime: new Date("2026-12-31T11:59:59"),

      theory_exam_set: {
        id: 101,
        set_name: "React Final Assessment",
        exam_duration: 60,
        total_questions: 50,
        instruction: `
      <div>
        <h3>Exam Instructions</h3>
        <ol>
          <li>The exam duration is 60 minutes.</li>
          <li>The exam contains 50 questions.</li>
          <li>Each question carries equal marks.</li>
          <li>There is no negative marking.</li>
          <li>Do not refresh or close the browser during the exam.</li>
          <li>Click Submit before the timer expires.</li>
        </ol>
      </div>
      `
      }
    },

    student_exam_set_results: [
      {
        id: 1,
        student_id: 1001,
        exam_set_id: 101,
        total_attempts: 1,
        score: 38,
        status: "IN_PROGRESS",
        created_at: new Date(),
        updated_at: new Date()
      }
    ],

    feedback_submitted: false
  };

  const getExamInstructions = async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const data = mockData;

    console.log("Mock API Response:", data);

    setBatchData(data.batch);

    setStudentExamResults(
      data.student_exam_set_results
        ? data.student_exam_set_results.find(
          (studentResult) =>
            studentResult.exam_set_id ===
            data.batch.theory_exam_set.id
        )
        : null
    );

    setExamSet(data.batch.theory_exam_set);

    setFeedbackSubmitted(data.feedback_submitted);
  };

  useEffect(() => {
    console.log('studentExamResults updated:', studentExamResults);
  }, [studentExamResults])

  useEffect(() => {
    console.log('remainingAttempts updated:', remainingAttempts);
  }, [remainingAttempts])

  useEffect(() => {

    if (batchData?.login_restrict && studentExamResults?.total_attempts) {
      setRemainingAttempts(batchData.login_restrict - studentExamResults.total_attempts <= 0 ? 0 : batchData.login_restrict - studentExamResults.total_attempts)
    } else if (batchData?.login_restrict) {
      setRemainingAttempts(batchData.login_restrict)
    }

  }, [batchData, studentExamResults])

  const [currentTime, setCurrentTime] = useState();

  useEffect(() => {
    const interval = setInterval(() => {
      if (batchData && batchData?.assessment_start_datetime) {
        const now = new Date();

        // Update the current time state
        setCurrentTime(now); // Update current time in Asia/Kolkata timezone
      }
    }, 1000); // Update every second

    return () => clearInterval(interval); // Clean up the interval when the component unmounts
  }, [batchData]);

  // Set isClient to true once the component has mounted on the client-side
  useEffect(() => {
    setIsClient(true);
    getExamInstructions();
  }, []);

  const handleStartExam = (url) => {
    if (typeof window === "undefined") return;

    const newWindow = window.open(
      url,
      "_blank",
      `width=${window.screen.availWidth},
     height=${window.screen.availHeight},
     toolbar=1,
     location=0,
     scrollbars=no,
     resizable=no`
    );

    if (!newWindow) return;

    // Disable right-click
    newWindow.document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // Disable text selection
    newWindow.document.body.style.userSelect = "none";

    // Disable keyboard shortcuts
    newWindow.document.addEventListener("keydown", (e) => {
      if (
        e.key === "F12" ||
        e.key === "F1" ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    });

    // Update remaining attempts
    setRemainingAttempts((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // Disable resizing the window (it's already in the `window.open()` options, but you can reinforce it)
  // newWindow.resizeTo(1024, 750);


  // Ensure the code below only runs client-side
  if (!isClient) {
    return null; // Return nothing while waiting for the component to mount
  }

  // Construct the exam page URL dynamically based on the current locale
  const examPageUrl = window.location.origin + getLocalizedUrl('/examination', locale);

  return (
    <Grid container spacing={6}>
      <Grid item size={{ xs: 12 }}>
        <Card>
          <CardHeader title="Exam" />
          <CardContent>
            <Typography variant='h5' className='mbe-2'>
              {examSet?.set_name}
            </Typography>
            <Grid container>
              <Grid item size={{ xs: 12, sm: 6 }} className='flex flex-col pie-5 gap-[26px]'>
                <div className='flex items-center gap-2.5'>
                  <div className='flex'>
                    <i className='tabler-clock text-xl text-textSecondary' />
                  </div>
                  <Typography color='text.secondary'>Exam Duration: {examSet?.exam_duration} Minutes</Typography>
                </div>
                <div className='flex items-center gap-2.5'>
                  <div className='flex'>
                    <i className='tabler-calendar-time text-xl text-textSecondary' />
                  </div>
                  <Typography color='text.secondary'>Exam Start Date Time: {batchData?.assessment_start_datetime ? format(batchData.assessment_start_datetime, 'dd-MMM-yyyy hh:mm a') : ""}</Typography>
                </div>
                <div className='flex items-center gap-2.5'>
                  <div className='flex'>
                    <i className='tabler-calendar-time text-xl text-textSecondary' />
                  </div>
                  <Typography color='text.secondary'>Current Date Time: {currentTime ? format(currentTime, 'dd-MMM-yyyy hh:mm a') : ""}</Typography>
                </div>
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }} className='flex flex-col max-sm:mbs-[26px] sm:ps-5 sm:border-s gap-[26px]'>
                <div className='flex items-center gap-2.5'>
                  <div className='flex'>
                    <i className='tabler-align-left text-xl text-textSecondary' />
                  </div>
                  <Typography color='text.secondary'>Total Questions: {examSet?.total_questions}</Typography>
                </div>
                <div className='flex items-center gap-2.5'>
                  <div className='flex'>
                    <i className='tabler-calendar-time text-xl text-textSecondary' />
                  </div>
                  <Typography color='text.secondary'>Exam End Date Time: {batchData?.assessment_end_datetime ? format(batchData.assessment_end_datetime, 'dd-MMM-yyyy hh:mm a') : ""}</Typography>
                </div>
                <div className='flex items-center gap-2.5'>
                  <div className='flex'>
                    <i className='tabler-calendar-time text-xl text-textSecondary' />
                  </div>
                  <Typography color='text.secondary'>Remaining Attempts: {remainingAttempts}</Typography>
                </div>
              </Grid>
            </Grid>
            <Divider className='mbs-7 mbe-7' />
            <Typography variant='h5' className='mbe-2'>Instructions</Typography>
            <Grid item size={{ xs: 12 }}>{examSet?.instruction || <DefaultExamInstructions />}</Grid>

          </CardContent>
          {examSet && remainingAttempts > 0 && batchData?.assessment_start_datetime && new Date(batchData?.assessment_start_datetime) <= new Date() &&
            batchData?.assessment_end_datetime && new Date() <= new Date(batchData?.assessment_end_datetime) && !feedbackSubmitted && (
              <CardActions>
                <Button variant="contained" onClick={() => handleStartExam(examPageUrl)}>
                  {batchData.login_restrict && remainingAttempts < batchData.login_restrict ? 'Resume Exam' : 'Start Exam'}
                </Button>
              </CardActions>
            )
          }

        </Card>
      </Grid>
    </Grid>
  )
}

export default ExamTest;
