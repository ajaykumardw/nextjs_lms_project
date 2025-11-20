'use client';

import { useEffect, useRef, useState } from 'react';

import { renderAsync } from 'docx-preview';

export default function DocViewer({ fileUrl, onPageLoad }) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const pageHeightPx = 719;
  const totalPagesRef = useRef(1);
  const currentPageRef = useRef(1); // Track current page internally

  const zoomIn = () => setZoom(z => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));

  useEffect(() => {
    if (!fileUrl || !containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;

    let handleScroll;

    // Render DOCX only once
    fetch(fileUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => renderAsync(buffer, content))
      .then(() => {
        totalPagesRef.current = Math.max(
          1,
          Math.ceil(content.scrollHeight / pageHeightPx)
        );

        // Send initial page info, but only if parent hasn't set it yet
        onPageLoad?.(currentPageRef.current, totalPagesRef.current);

        handleScroll = () => {
          const scrollTop = container.scrollTop;

          const newPage = Math.min(
            totalPagesRef.current,
            Math.floor(scrollTop / pageHeightPx) + 1
          );

          if (newPage !== currentPageRef.current) {
            currentPageRef.current = newPage;
            onPageLoad?.(newPage, totalPagesRef.current);
          }
        };

        container.addEventListener('scroll', handleScroll);
      })
      .catch(err => console.error('Error rendering docx:', err));

    return () => {
      if (handleScroll && container) container.removeEventListener('scroll', handleScroll);
    };
  }, [fileUrl, onPageLoad]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Zoom Controls */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '8px 12px',
          background: '#f7f7f7',
          borderBottom: '1px solid #ddd',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <button onClick={zoomOut}>− Zoom Out</button>
        <button onClick={zoomIn}>+ Zoom In</button>
      </div>

      {/* Scrollable container */}
      <div
        ref={containerRef}
        style={{
          height: '100%',
          width: '100%',
          overflowY: 'auto',
          background: '#fff',
          padding: 10,
        }}
      >
        {/* Inner wrapper with zoom using CSS zoom */}
        <div
          ref={contentRef}
          style={{
            zoom: zoom,
            width: '100%',
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
}
