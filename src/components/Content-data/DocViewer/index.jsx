'use client';

import { useEffect, useState } from 'react';

import { renderAsync } from 'docx-preview';

export default function DocxViewer({ fileUrl, onPageLoad }) {
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));

  useEffect(() => {
    const container = document.getElementById('docx-container');

    if (!container) return;

    container.innerHTML = '';

    fetch(fileUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) =>
        renderAsync(buffer, container).then((viewer) => {
          const totalPages = viewer?.pages?.length || 1;
          
          onPageLoad && onPageLoad(1, totalPages);
        })
      );

  }, [fileUrl]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Zoom Toolbar */}
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
        <button
          onClick={zoomOut}
          style={{
            padding: '6px 12px',
            background: '#e8e8e8',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: '0.2s',
          }}
        >
          − Zoom Out </button>


        <button
          onClick={zoomIn}
          style={{
            padding: '6px 12px',
            background: '#e8e8e8',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: '0.2s',
          }}
        >
          + Zoom In
        </button>
      </div>

      {/* Document Container */}
      <div
        id="docx-container"
        style={{
          height: '100%',
          width: '100%',
          overflowY: 'auto',
          background: '#fff',
          padding: 10,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      />
    </div>

  );
}
