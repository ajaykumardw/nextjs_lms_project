'use client'

import { useRef, useState, useEffect } from 'react'

import { Box } from "@mui/material"
import ReactPlayer from 'react-player'

const YouTubePlayerComponent = ({ url, setFieldData, pageData }) => {
  const playerRef = useRef(null)

  const [totalVideoTime, setTotalVideoTime] = useState(0)
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [viewedVideoTime, setViewedVideoTime] = useState(0)

  // Seek video to saved current time when pageData is loaded
  useEffect(() => {
    if (!playerRef.current || pageData?.current_video_time == null) return;

    const seekTime = Number(pageData.current_video_time);

    if (!isNaN(seekTime)) {
      playerRef.current.seekTo(seekTime, 'seconds');
    }
  }, [pageData?.current_video_time]);

  // Send updated values upward
  useEffect(() => {
    if (setFieldData) {
      setFieldData({
        totalVideoTime,
        currentVideoTime,
        viewedVideoTime
      })
    }
  }, [totalVideoTime, currentVideoTime, viewedVideoTime, setFieldData])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 1
      }}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        controls
        width="100%"
        height="100%"
        onDuration={(duration) => {
          setTotalVideoTime(duration)
        }}
        onProgress={(state) => {
          const roundedTime = Math.round(state.playedSeconds)

          setCurrentVideoTime(roundedTime)
          setViewedVideoTime(prev => Math.max(prev, roundedTime))
        }}
      />
    </Box>
  )
}

export default YouTubePlayerComponent
