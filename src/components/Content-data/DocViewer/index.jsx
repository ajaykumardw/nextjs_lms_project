'use client';

import { useEffect, useRef, useState } from 'react';

import { renderAsync } from 'docx-preview';

export default function DocViewer({ fileUrl, onPageLoad, setFieldData }) {
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewedPages, setViewedPages] = useState([]);

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const pageHeightPx = 719;

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));

  useEffect(() => {
    if (!fileUrl || !containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;

    let handleScroll;

    fetch(fileUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => renderAsync(buffer, content))
      .then(() => {
        const pages = Math.max(
          1,
          Math.ceil(content.scrollHeight / pageHeightPx)
        );

        setTotalPages(pages);

        handleScroll = () => {
          const scrollTop = container.scrollTop;

          const newPage = Math.min(
            pages,
            Math.floor(scrollTop / pageHeightPx) + 1
          );

          setCurrentPage(newPage);

          setViewedPages((prev) => {
            const arr = Array.isArray(prev) ? [...prev] : [];

            if (!arr.includes(newPage)) arr.push(newPage);

            return arr;
          });

          onPageLoad?.(newPage, pages);
        };

        container.addEventListener('scroll', handleScroll);

        // Trigger initial detection
        handleScroll();
      })
      .catch((err) => console.error('Error rendering docx:', err));

    return () => {
      if (handleScroll && container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [fileUrl, onPageLoad]);

  // Sync updates back to parent
  useEffect(() => {
    setFieldData?.((prev) => ({
      ...prev,
      currentPage,
    }));
  }, [currentPage]);

  useEffect(() => {
    setFieldData?.((prev) => ({
      ...prev,
      totalPages,
    }));
  }, [totalPages]);

  useEffect(() => {
    setFieldData?.((prev) => ({
      ...prev,
      viewedPages,
    }));
  }, [viewedPages]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Zoom Controls */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '8px',
          background: '#f7f7f7',
          position: 'sticky',
          top: 0,
        }}
      >
        <button onClick={zoomOut}>– Zoom Out</button>
        <button onClick={zoomIn}>+ Zoom In</button>
      </div>

      {/* DOCX Scroll Container */}
      <div
        ref={containerRef}
        style={{
          height: '100%',
          overflowY: 'auto',
          background: '#fff',
          padding: 10,
        }}
      >
        <div ref={contentRef} style={{ zoom, transformOrigin: 'top left' }} />
      </div>
    </div>
  );
}
