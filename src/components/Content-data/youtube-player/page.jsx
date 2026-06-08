'use client'

import { useRef, useState, useEffect } from 'react'
import { Box } from '@mui/material'
import ReactPlayer from 'react-player'

const YouTubePlayerComponent = ({ url, setFieldData, pageData }) => {
  const playerRef = useRef(null)
  const pendingSeekRef = useRef(null)
  const restoredRef = useRef(false)

  const [totalVideoTime, setTotalVideoTime] = useState(0)
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [viewedVideoTime, setViewedVideoTime] = useState(0)

  useEffect(() => {
    if (!pageData) return

    const dbTotal = Number(pageData.total_video_time) || 0
    const dbCurrent = Number(pageData.current_video_time) || 0
    const dbViewed = Number(pageData.viewed_video_time) || 0

    setTotalVideoTime(dbTotal)
    setCurrentVideoTime(dbCurrent)
    setViewedVideoTime(dbViewed)

    if (dbCurrent > 0) {
      pendingSeekRef.current = dbCurrent
    }

  }, [pageData])

  useEffect(() => {
    if (!setFieldData) return

    setFieldData(prev => ({
      ...prev,
      totalVideoTime,
      currentVideoTime,
      viewedVideoTime,
    }))
  }, [
    totalVideoTime,
    currentVideoTime,
    viewedVideoTime,
    setFieldData,
  ])

  const normalizeYoutubeUrl = url => {
    const match = url?.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^?&]+)/,
    )

    return match
      ? `https://www.youtube.com/watch?v=${match[1]}`
      : url
  }

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
        url={normalizeYoutubeUrl(url)}
        controls
        width="100%"
        height="100%"
        config={{
          youtube: {
            playerVars: {
              origin:
                typeof window !== 'undefined'
                  ? window.location.origin
                  : '',
            },
          },
        }}
        onPlay={() => {
          if (
            !restoredRef.current &&
            pendingSeekRef.current > 0
          ) {
            restoredRef.current = true

            const seekTime = pendingSeekRef.current

            setTimeout(() => {
              try {
                playerRef.current?.seekTo(seekTime)
                pendingSeekRef.current = null
              } catch (err) {
                console.error('Seek failed', err)
              }
            }, 100)
          }
        }}
        onDuration={duration => {
          setTotalVideoTime(prev =>
            Math.max(prev, Math.ceil(duration))
          )
        }}
        onProgress={state => {
          const rounded = Math.floor(
            state.playedSeconds
          )

          setCurrentVideoTime(prev =>
            Math.max(prev, rounded)
          )

          setViewedVideoTime(prev =>
            Math.max(prev, rounded)
          )
        }}
        onEnded={() => {
          setCurrentVideoTime(totalVideoTime)
          setViewedVideoTime(totalVideoTime)
        }}
        onError={error => {
          console.error(
            'ReactPlayer Error:',
            error
          )
        }}
      />
    </Box>
  )
}

export default YouTubePlayerComponent
