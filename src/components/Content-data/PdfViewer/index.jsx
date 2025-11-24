'use client';

import { useEffect, useState, useCallback } from 'react';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

export default function PdfViewer({ pdfUrl, onPageChange, setFieldData, pageData }) {
    const zoomPluginInstance = zoomPlugin();
    const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);
    const [viewedPages, setViewedPages] = useState([]);

    // Update from parent pageData
    useEffect(() => {
        if (pageData) {
            let newCurrent = pageData.current_page_no || 1;
            let newViewedPages = Array.isArray(pageData.view_page_no)
                ? Array.from(new Set(pageData.view_page_no))
                : [];

            // Ensure currentPage is within totalPages
            if (totalPages && newCurrent > totalPages) {
                newCurrent = totalPages;
            }

            setCurrentPage(newCurrent);
            setViewedPages(newViewedPages);
        }
    }, [pageData, totalPages]);

    const handlePageChange = useCallback((e) => {
        let newCurrentPage = Number(e.currentPage) + 1;
        const newTotalPages = e.doc.numPages;

        // Ensure currentPage is within totalPages
        if (newCurrentPage > newTotalPages) {
            newCurrentPage = newTotalPages;
        }

        setCurrentPage(newCurrentPage);
        setTotalPages(newTotalPages);

        // Update viewedPages uniquely
        setViewedPages(prev => {
            const updated = new Set(prev.map(Number));

            updated.add(newCurrentPage);

            return Array.from(updated).sort((a, b) => a - b);
        });

        onPageChange?.(newCurrentPage, newTotalPages);
    }, [onPageChange]);

    // Sync state to parent
    useEffect(() => {
        setFieldData?.(prev => ({ ...prev, currentPage }));
    }, [currentPage]);

    useEffect(() => {
        setFieldData?.(prev => ({ ...prev, totalPages }));
    }, [totalPages]);

    useEffect(() => {
        setFieldData?.(prev => ({ ...prev, viewedPages }));
    }, [viewedPages]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '10px', padding: '8px' }}>
                <ZoomOutButton>{({ onClick }) => <button onClick={onClick}>− Zoom Out</button>}</ZoomOutButton>
                <ZoomInButton>{({ onClick }) => <button onClick={onClick}>+ Zoom In</button>}</ZoomInButton>
            </div>

            {/* Viewer */}
            <div style={{ flex: 1, width: '100%', overflowY: 'auto' }}>
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer
                        fileUrl={pdfUrl}
                        initialPage={currentPage - 1} // zero-based
                        plugins={[zoomPluginInstance]}
                        onPageChange={handlePageChange}
                        onDocumentLoad={e => {
                            setTotalPages(e.doc.numPages);

                            // Ensure currentPage is within totalPages on load
                            if (currentPage > e.doc.numPages) {
                                setCurrentPage(e.doc.numPages);
                            }
                        }}
                    />
                </Worker>
            </div>
        </div>
    );
}
