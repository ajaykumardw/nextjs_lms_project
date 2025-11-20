'use client';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

export default function PdfViewer({ pdfUrl, onPageChange }) {
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  const handlePageChange = (e) => {
    onPageChange && onPageChange(e.currentPage + 1, e.doc.numPages);
  };

  return (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Custom Zoom Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <ZoomOutButton>
          {({ onClick }) => (
            <button
              onClick={onClick}
              style={{
                padding: '6px 16px',
                backgroundColor: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: '0.2s',
              }}
            >
              − Zoom Out
            </button>
          )}
        </ZoomOutButton>

        <ZoomInButton>
          {({ onClick }) => (
            <button
              onClick={onClick}
              style={{
                padding: '6px 16px',
                backgroundColor: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: '0.2s',
              }}
            >
              + Zoom In
            </button>
          )}
        </ZoomInButton>
      </div>

      {/* PDF Viewer */}
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'center', // Center PDF horizontally
          overflow: 'auto',
        }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[zoomPluginInstance]}
            onPageChange={handlePageChange}
            theme={{
              // optional: center PDF pages
              themeColors: {
                primary: '#1976d2',
              },
            }}
          />
        </Worker>
      </div>
    </div>
  );
}
