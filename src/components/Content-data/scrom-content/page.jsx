"use client";

import { Box, Card, CardContent } from "@mui/material";

export default function ScormViewer({ url }) {
  const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Card sx={{ height: { xs: "65vh", sm: "75vh", md: "90vh" } }}>
        <CardContent sx={{ height: "100%", p: 0 }}>
          <iframe
            src={`${assert_url}/${url}`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allow="fullscreen"
          />
        </CardContent>
      </Card>
    </Box>
  );
}
