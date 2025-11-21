'use client';

import { useEffect, useState } from 'react';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

export default function PdfViewer({ pdfUrl, onPageChange, setFieldData }) {
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [viewedPages, setViewedPages] = useState([]);

  const handlePageChange = (e) => {
    const newCurrentPage = e.currentPage + 1;
    const newTotalPages = e.doc.numPages;

    setCurrentPage(newCurrentPage);
    setTotalPages(newTotalPages);

    setViewedPages((prev) => {
      const arr = Array.isArray(prev) ? [...prev] : [];

      if (!arr.includes(newCurrentPage)) arr.push(newCurrentPage);

      return arr;
    });

    onPageChange?.(newCurrentPage, newTotalPages);
  };

  // 🔹 Sync current page to parent
  useEffect(() => {
    if (setFieldData && currentPage !== null) {
      setFieldData((prev) => ({
        ...prev,
        currentPage,
      }));
    }
  }, [currentPage]);

  // 🔹 Sync total pages
  useEffect(() => {
    if (setFieldData && totalPages) {
      setFieldData((prev) => ({
        ...prev,
        totalPages,
      }));
    }
  }, [totalPages]);

  // 🔹 Sync viewed pages
  useEffect(() => {
    if (setFieldData) {
      setFieldData((prev) => ({
        ...prev,
        viewedPages,
      }));
    }
  }, [viewedPages]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '10px', padding: '8px' }}>
        <ZoomOutButton>
          {({ onClick }) => <button onClick={onClick}>− Zoom Out</button>}
        </ZoomOutButton>

        <ZoomInButton>
          {({ onClick }) => <button onClick={onClick}>+ Zoom In</button>}
        </ZoomInButton>
      </div>

      {/* Viewer */}
      <div style={{ flex: 1, width: '100%', overflowY: 'auto' }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[zoomPluginInstance]}
            onPageChange={handlePageChange}
            onDocumentLoad={(e) => {
              setTotalPages(e.doc.numPages);
            }}
          />
        </Worker>
      </div>
    </div>
  );
}
