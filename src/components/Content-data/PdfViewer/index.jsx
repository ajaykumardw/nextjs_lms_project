'use client';

import { useState } from 'react';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';

import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

export default function PdfViewer({ pdfUrl, onPageChange }) {
  const [page, setPage] = useState(1);

  const pageNavPlugin = pageNavigationPlugin();
  const zoom = zoomPlugin();

  const { ZoomInButton, ZoomOutButton } = zoom;

  const handlePageChange = (e) => {
    setPage(e.currentPage + 1);
    onPageChange && onPageChange(e.currentPage + 1, e.doc.numPages);
  };

  return (
    <div style={{ height: '80vh', position: 'relative' }}>
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
          alignItems: 'center',
        }}
      >
        <button
          style={{
            padding: '6px 12px',
            background: '#e8e8e8',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: '0.2s',
          }}
          onClick={() => document.querySelector('button[aria-label="Zoom out"]').click()}
        >
          − Zoom Out </button>

        <button
          style={{
            padding: '6px 12px',
            background: '#e8e8e8',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: '0.2s',
          }}
          onClick={() => document.querySelector('button[aria-label="Zoom in"]').click()}
        >
          + Zoom In
        </button>
      </div>

      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={pdfUrl}
          plugins={[pageNavPlugin, zoom]}
          onPageChange={handlePageChange}
        />
      </Worker>
    </div>

  );
}
