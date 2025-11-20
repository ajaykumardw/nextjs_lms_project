'use client';

import { useEffect, useState } from 'react';

import { renderAsync } from 'docx-preview';

export default function DocxViewer({ fileUrl, onPageLoad }) {
  const [zoom, setZoom] = useState(1);
  const pageHeightPx = 1122; // Approx 1 Word A4 page @96DPI

  const zoomIn = () => setZoom(z => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));

  useEffect(() => {
    const container = document.getElementById('docx-container');

    if (!container) return;


    container.innerHTML = '';

    fetch(fileUrl)
      .then(res => res.arrayBuffer())
      .then(buffer =>
        renderAsync(buffer, container).then(() => {
          // Delay so browser paints first
          setTimeout(() => {
            const totalHeight = container.scrollHeight;

            const totalPages = Math.max(
              1,
              Math.ceil((totalHeight / zoom) / pageHeightPx)
            );

            // Initial
            onPageLoad && onPageLoad(1, totalPages);

            const handleScroll = () => {
              const scrollTop = container.scrollTop / zoom;

              const currentPage =
                Math.min(
                  totalPages,
                  Math.floor(scrollTop / pageHeightPx) + 1
                );

              onPageLoad && onPageLoad(currentPage, totalPages);
            };

            container.addEventListener('scroll', handleScroll);

            return () => container.removeEventListener('scroll', handleScroll);
          }, 200);
        })
      );

  }, [fileUrl, zoom]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
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
      > <button onClick={zoomOut}>− Zoom Out</button> <button onClick={zoomIn}>+ Zoom In</button> </div>


      <div
        id="docx-container"
        style={{
          height: '100%',
          width: '100%',
          overflowY: 'auto',
          background: '#fff',
          padding: 10,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      />
    </div>

  );
}
