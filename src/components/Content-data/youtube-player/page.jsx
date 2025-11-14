'use client'

import {
  Box
} from "@mui/material"

import ReactPlayer from 'react-player'

const YouTubePlayerComponent = ({ url }) => {
  return (
    <>
      <Box sx={{ position: 'relative', width: '100%', height: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
        <ReactPlayer
          url={url}
          controls
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </Box>
    </>
  )
}

export default YouTubePlayerComponent
