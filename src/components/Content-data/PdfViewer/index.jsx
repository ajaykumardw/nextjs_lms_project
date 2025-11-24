'use client';

import { useEffect, useRef, useState } from 'react';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

export default function PdfViewer({ pdfUrl, onPageChange, setFieldData, pageData }) {
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  const initializedFromParent = useRef(false);
  const ignoreNextPageEvent = useRef(true); // <── Blocks the auto page = 1 event

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [viewedPages, setViewedPages] = useState([]);

  // ---------------- INITIAL LOAD FROM PARENT ----------------
  useEffect(() => {
    if (!initializedFromParent.current && pageData) {
      setCurrentPage(Number(pageData?.current_page_no) || 1);

      setViewedPages(
        Array.isArray(pageData?.view_page_no)
          ? pageData.view_page_no.map((p) => Number(p))
          : []
      );

      initializedFromParent.current = true;
    }
  }, [pageData]);

  // ---------------- PAGE CHANGE HANDLER ----------------
  const handlePageChange = (e) => {
    const newCurrentPage = Number(e.currentPage + 1);
    const newTotalPages = Number(e.doc.numPages);

    // BLOCK FIRST FAKE EVENT (usually page=1)
    if (ignoreNextPageEvent.current) {
      ignoreNextPageEvent.current = false;

      return;
    }

    // Ignore duplicate events
    if (newCurrentPage === currentPage) return;

    setCurrentPage(newCurrentPage);
    setTotalPages(newTotalPages);

    setViewedPages((prev) => {
      const arr = prev.map((p) => Number(p));

      if (!arr.includes(newCurrentPage)) arr.push(newCurrentPage);

      return arr;
    });

    onPageChange?.(newCurrentPage, newTotalPages);
  };

  // ---------------- SEND TO PARENT ----------------
  useEffect(() => {
    if (!initializedFromParent.current) return;
    setFieldData?.((p) => ({ ...p, currentPage }));
  }, [currentPage]);

  useEffect(() => {
    if (!initializedFromParent.current) return;
    setFieldData?.((p) => ({ ...p, totalPages }));
  }, [totalPages]);

  useEffect(() => {
    if (!initializedFromParent.current) return;
    setFieldData?.((p) => ({ ...p, viewedPages }));
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

      {/* PDF Viewer */}

      <div style={{ flex: 1, width: '100%', overflowY: 'auto' }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            initialPage={Number(currentPage || 1)}
            plugins={[zoomPluginInstance]}
            onPageChange={handlePageChange}
            onDocumentLoad={(e) => {
              setTotalPages(e.doc.numPages);
            }}
          />
        </Worker>
      </div>
    </div >
  );
}
