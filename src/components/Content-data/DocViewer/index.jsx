'use client';

import { useEffect, useRef, useState } from 'react';

import { renderAsync } from 'docx-preview';

export default function DocViewer({ fileUrl, onPageLoad, setFieldData, pageData }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [viewedPages, setViewedPages] = useState(
    Array.isArray(pageData?.view_page_no)
      ? pageData.view_page_no.map(Number)
      : [1]
  );

  const allowScrollEvents = useRef(false);
  const ZOOM_PAGE_HEIGHT = 1100;
  const restoreToPage = Number(pageData?.current_page_no) || 1;

  const zoomIn = () => setZoom(z => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));

  useEffect(() => {
    if (!fileUrl || !containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;
    let scrollHandler = null;
    let resizeObserver = null;

    allowScrollEvents.current = false;

    fetch(fileUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => renderAsync(buffer, content))
      .then(() => {
        resizeObserver = new ResizeObserver(() => {
          const docHeight = content.scrollHeight;
          const pages = Math.max(1, Math.round(docHeight / ZOOM_PAGE_HEIGHT));

          setTotalPages(pages);

          const scrollPage = Math.min(Math.max(restoreToPage, 1), pages);

          container.scrollTop = (scrollPage - 1) * (docHeight / pages);
          setCurrentPage(scrollPage);

          setViewedPages(prev => {
            const arr = [...new Set(prev)];

            if (!arr.includes(scrollPage)) arr.push(scrollPage);

            if (!arr.includes(1)) arr.unshift(1);

            return arr;
          });

          setTimeout(() => allowScrollEvents.current = true, 300);
          onPageLoad?.(scrollPage, pages);
        });

        resizeObserver.observe(content);

        scrollHandler = () => {
          if (!allowScrollEvents.current) return;

          const docHeight = content.scrollHeight;
          const pages = Math.max(1, Math.round(docHeight / ZOOM_PAGE_HEIGHT));
          let newPage;

          if (container.scrollTop <= 2) newPage = 1; // top-most
          else newPage = Math.min(
            pages,
            Math.max(1, Math.floor(container.scrollTop / (docHeight / pages)) + 1)
          );

          if (newPage !== currentPage) {
            setCurrentPage(newPage);
            setViewedPages(prev => {
              const arr = [...new Set(prev)];

              if (!arr.includes(newPage)) arr.push(newPage);
              if (!arr.includes(1)) arr.unshift(1);

              return arr;
            });
            onPageLoad?.(newPage, pages);
          }
        };

        container.addEventListener('scroll', scrollHandler);
      });

    return () => {
      if (scrollHandler) container.removeEventListener('scroll', scrollHandler);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [fileUrl]);

  // ---------------- SEND TO PARENT ----------------
  useEffect(() => { setFieldData?.(p => ({ ...p, currentPage })); }, [currentPage]);
  useEffect(() => { setFieldData?.(p => ({ ...p, totalPages })); }, [totalPages]);
  useEffect(() => { setFieldData?.(p => ({ ...p, viewedPages })); }, [viewedPages]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', gap: 8, padding: 8, background: '#f0f0f0', position: 'sticky', top: 0, zIndex: 5 }}>
        <button onClick={zoomOut}>-</button>
        <button onClick={zoomIn}>+</button>
      </div>
      <div ref={containerRef} style={{ height: '100%', overflowY: 'auto', background: '#fff', padding: 10 }}>
        <div ref={contentRef} style={{ zoom, transformOrigin: 'top left' }} />
      </div>
    </div>
  );
}
