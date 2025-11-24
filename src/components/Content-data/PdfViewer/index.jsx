'use client';

import { useEffect, useState } from 'react';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

export default function PdfViewer({ pdfUrl, onPageChange, setFieldData, pageData }) {
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;


  // Initialize viewedPages from parent
  const [viewedPages, setViewedPages] = useState(
    []
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);

  useEffect(() => {
    if (pageData) {
      setCurrentPage(pageData?.current_page_no)
      setViewedPages(Array.isArray(pageData?.view_page_no) ? [...pageData.view_page_no] : [] )
    }

  }, [pageData]);

  const handlePageChange = (e) => {
    const newCurrentPage = e.currentPage + 1;
    const newTotalPages = e.doc.numPages;

    setCurrentPage(newCurrentPage);
    setTotalPages(newTotalPages);

    // Add to viewed pages if new
    setViewedPages((prev) => {
      const arr = Array.isArray(prev) ? [...prev] : [];

      if (!arr.includes(newCurrentPage)) arr.push(newCurrentPage);

      return arr;
    });

    onPageChange?.(newCurrentPage, newTotalPages);
  };

  // Save currentPage to parent
  useEffect(() => {
    setFieldData?.((prev) => ({
      ...prev,
      currentPage,
    }));
  }, [currentPage]);

  // Save totalPages
  useEffect(() => {
    setFieldData?.((prev) => ({
      ...prev,
      totalPages,
    }));
  }, [totalPages]);

  // Save viewedPages
  useEffect(() => {
    setFieldData?.((prev) => ({
      ...prev,
      viewedPages,
    }));
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
          {currentPage}
          <Viewer
            fileUrl={pdfUrl}
            initialPage={(currentPage || 1)}
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
