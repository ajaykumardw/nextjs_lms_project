'use client';

import { useState } from 'react';

import { Viewer, Worker } from '@react-pdf-viewer/core';

import '@react-pdf-viewer/core/lib/styles/index.css';

import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';

export default function PdfViewer({ pdfUrl, onPageChange }) {
    const [page, setPage] = useState(1);

    const pageNavPlugin = pageNavigationPlugin();

    // This listens for page change events
    const handlePageChange = (e) => {
        setPage(e.currentPage + 1);
        if (onPageChange) onPageChange(e.currentPage + 1, e.doc.numPages);
    };

    return (
        <div style={{ height: '80vh' }}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                    fileUrl={pdfUrl}
                    plugins={[pageNavPlugin]}
                    onPageChange={handlePageChange}
                />
            </Worker>
        </div>
    );
}
