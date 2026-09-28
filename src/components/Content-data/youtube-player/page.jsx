'use client'

import { useRef, useState, useEffect } from 'react'

import { Box } from '@mui/material'

import ReactPlayer from 'react-player'

const normalizeYoutubeUrl = url => {
  const match = url?.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^?&]+)/)

  return match ? `https://www.youtube.com/watch?v=${match[1]}` : url
}

const YouTubePlayerComponent = ({ url, setFieldData, pageData }) => {
  const playerRef = useRef(null)
  const pendingSeekRef = useRef(null)
  const restoredRef = useRef(false)
  const durationRef = useRef(0)

  const [totalVideoTime, setTotalVideoTime] = useState(0)
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [viewedVideoTime, setViewedVideoTime] = useState(0)

  // Restore saved progress, ignoring impossible values
  useEffect(() => {
    if (!pageData) return

    const dbTotal = Number(pageData.total_video_time) || 0
    const dbCurrent = Number(pageData.current_video_time) || 0
    const dbViewed = Number(pageData.viewed_video_time) || 0

    // Progress is only trustworthy if a total was saved with it
    if (dbTotal <= 0) return

    durationRef.current = dbTotal

    setTotalVideoTime(dbTotal)
    setCurrentVideoTime(Math.min(dbCurrent, dbTotal))
    setViewedVideoTime(Math.min(dbViewed, dbTotal))

    if (dbCurrent > 0) pendingSeekRef.current = Math.min(dbCurrent, dbTotal)
  }, [pageData])

  // Sync to the parent
  useEffect(() => {
    if (!setFieldData) return

    setFieldData(prev => ({
      ...prev,
      totalVideoTime,
      currentVideoTime,
      viewedVideoTime
    }))
  }, [totalVideoTime, currentVideoTime, viewedVideoTime, setFieldData])

  // The player is the source of truth for duration
  const handleDuration = duration => {
    const d = Math.ceil(Number(duration) || 0)

    if (!d) return

    durationRef.current = d

    setTotalVideoTime(d)
    setCurrentVideoTime(prev => Math.min(prev, d))
    setViewedVideoTime(prev => Math.min(prev, d))
  }

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
        url={normalizeYoutubeUrl(url)}
        controls
        width='100%'
        height='100%'
        config={{
          youtube: {
            playerVars: {
              origin: typeof window !== 'undefined' ? window.location.origin : ''
            }
          }
        }}
        onReady={() => {
          // Fallback in case onDuration doesn't fire
          handleDuration(playerRef.current?.getDuration?.())
        }}
        onDuration={handleDuration}
        onPlay={() => {
          // Some players only know their duration once playback starts
          if (!durationRef.current) handleDuration(playerRef.current?.getDuration?.())

          if (!restoredRef.current && pendingSeekRef.current > 0) {
            restoredRef.current = true

            const seekTime = pendingSeekRef.current

            setTimeout(() => {
              try {
                playerRef.current?.seekTo(seekTime, 'seconds')
                pendingSeekRef.current = null
              } catch (err) {
                console.error('Seek failed', err)
              }
            }, 100)
          }
        }}
        onProgress={state => {
          const max = durationRef.current || Infinity
          const rounded = Math.min(Math.floor(state.playedSeconds), max)

          setCurrentVideoTime(rounded)
          setViewedVideoTime(prev => Math.max(prev, rounded))
        }}
        onEnded={() => {
          const d = durationRef.current

          if (!d) return

          setCurrentVideoTime(d)
          setViewedVideoTime(d)
        }}
        onError={error => console.error('ReactPlayer Error:', error)}
      />
    </Box>
  )
}

export default YouTubePlayerComponent
