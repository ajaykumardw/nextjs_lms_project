'use client';

import { useEffect, useRef } from 'react';

export default function DocViewer({ fileUrl, onPageLoad }) {
  const iframeRef = useRef(null);

  // Estimated document page height in pixels
  const PAGE_HEIGHT = 1122;

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const onIFrameLoad = () => {
      try {
        const innerDoc =
          iframe.contentDocument || iframe.contentWindow.document;

        const scrollContainer = innerDoc.scrollingElement || innerDoc.body;

        const updatePage = () => {
          const scrollTop = scrollContainer.scrollTop;
          const totalHeight = scrollContainer.scrollHeight;

          const totalPages = Math.max(1, Math.ceil(totalHeight / PAGE_HEIGHT));

          const currentPage =
            Math.min(totalPages, Math.floor(scrollTop / PAGE_HEIGHT) + 1);

          onPageLoad && onPageLoad(currentPage, totalPages);
        };

        scrollContainer.addEventListener('scroll', updatePage);
        updatePage(); // initial fire
      } catch (err) {
        console.warn('Cross-origin iframe restricts access – cannot track page.');
      }
    };

    iframe.addEventListener('load', onIFrameLoad);

    return () =>
      iframe.removeEventListener('load', onIFrameLoad);
  }, [fileUrl]);

  const viewerUrl =
    `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <iframe
      ref={iframeRef}
      src={viewerUrl}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    />
  );
}
