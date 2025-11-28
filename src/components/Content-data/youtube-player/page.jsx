'use client'

import { useRef, useState, useEffect } from 'react'

import { Box } from "@mui/material"
import ReactPlayer from 'react-player'

const YouTubePlayerComponent = ({ url, setFieldData, pageData }) => {
  const playerRef = useRef(null)

  const [totalVideoTime, setTotalVideoTime] = useState(0)
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [viewedVideoTime, setViewedVideoTime] = useState(0)

  // Restore previously saved time
  useEffect(() => {
    if (!playerRef.current || pageData?.current_video_time == null) return

    const saved = Number(pageData.current_video_time)

    if (!isNaN(saved)) {
      playerRef.current.seekTo(saved, 'seconds')
    }
  }, [pageData?.current_video_time])

  // Push updated values upward (rounded)
  useEffect(() => {
    if (!setFieldData) return;

    setFieldData(prev => ({
      ...prev,
      totalVideoTime: Math.round(totalVideoTime),
      currentVideoTime: Math.round(currentVideoTime),
      viewedVideoTime: Math.round(viewedVideoTime),
    }))
  }, [totalVideoTime, currentVideoTime, viewedVideoTime])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 1,
      }}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        controls
        width="100%"
        height="100%"

        // TOTAL DURATION
        onDuration={(duration) => {
          setTotalVideoTime(Math.round(duration))
        }}

        // PROGRESS
        onProgress={(state) => {
          const rounded = Math.round(state.playedSeconds)

          setCurrentVideoTime(rounded)
          setViewedVideoTime(prev => Math.max(prev, rounded))
        }}
      />
    </Box>
  )
}

export default YouTubePlayerComponent
