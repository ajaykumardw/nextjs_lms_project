'use client';

import { useEffect } from 'react';

export default function PptViewer({ fileUrl, onPageLoad }) {

  // Set static page info (Office viewer can't detect slide changes)
  useEffect(() => {
    onPageLoad && onPageLoad(1, 1);    // Always page 1 of 1
  }, []);

  return (
    <iframe
      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        fileUrl
      )}`}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    />
  );
}
