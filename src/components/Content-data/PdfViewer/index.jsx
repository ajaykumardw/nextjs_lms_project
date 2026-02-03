'use client';

import { useEffect, useState, useCallback } from 'react';

import { PDFDocument } from 'pdf-lib';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography
} from '@mui/material';

import DialogCloseButton from '@/components/dialogs/DialogCloseButton';

export default function PdfViewer({ pdfUrl, onPageChange, setFieldData, pageData }) {

  const [pdfPages, setPdfPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [viewedPages, setViewedPages] = useState([]);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);

  // Load saved data
  useEffect(() => {
    if (pageData) {
      let newCurrent = pageData.current_page_no || 1;
      let newViewed = Array.isArray(pageData.view_page_no)
        ? Array.from(new Set(pageData.view_page_no))
        : [];

      if (totalPages && newCurrent > totalPages) {
        newCurrent = totalPages;
      }

      setCurrentPage(newCurrent);
      setViewedPages(newViewed);
    }
  }, [pageData, totalPages]);

  useEffect(() => {
    const fetchPdf = async () => {

      const response = await fetch(pdfUrl);
      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages().map((p, idx) => idx + 1); // page numbers

      setPdfPages(pages);
      setTotalPages(pages.length);
    };

    fetchPdf().catch(console.error);
  }, [pdfUrl]);

  // Handle page change
  const handlePageChange = useCallback(

    (pageNum) => {

      if (!pdfPages.length) return;

      let newPage = pageNum;
      if (pageNum > pdfPages.length) newPage = pdfPages.length;
      if (pageNum < 1) newPage = 1;

      setCurrentPage(newPage);
      setViewedPages((prev) => Array.from(new Set([...prev, newPage])).sort((a, b) => a - b));
      onPageChange?.(newPage, pdfPages.length);
    },
    [onPageChange, pdfPages]
  );

  useEffect(() => {

    setFieldData?.((prev) => ({ ...prev, currentPage }));
  }, [currentPage]);

  useEffect(() => {

    setFieldData?.((prev) => ({ ...prev, totalPages }));
  }, [totalPages]);

  useEffect(() => {

    setFieldData?.((prev) => ({ ...prev, viewedPages }));
  }, [viewedPages]);

  const unreadPages =

    totalPages !== null
      ? Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => !viewedPages.includes(p))
      : [];

  return (

    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>


      <div style={{ display: 'flex', gap: '10px', padding: '8px', alignItems: 'center' }}>

        <button onClick={() => handlePageChange(currentPage - 1)}>− Previous</button>
        <button onClick={() => handlePageChange(currentPage + 1)}>+ Next</button>

        <IconButton color="primary" onClick={() => setOpenDialog(true)}>
          <i className="tabler-menu"></i>
        </IconButton>

        <Typography>
          Page {currentPage} / {totalPages || '-'}
        </Typography>
      </div>

      {/* PDF Preview */}
      <div style={{ flex: 1, width: '100%', overflowY: 'auto', padding: '10px', border: '1px solid #ddd' }}>
        {pdfPages.length
          ? <Typography>Rendering Page {currentPage} (Preview placeholder)</Typography>
          : <Typography>Loading PDF…</Typography>
        }
      </div>

      {/* MUI Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>Page Information</DialogTitle>

        <DialogCloseButton onClick={() => setOpenDialog(false)} disableRipple>
          <i className="tabler-x" />
        </DialogCloseButton>

        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>Read Pages</Typography>
          <Typography mb={2}>{viewedPages.length ? viewedPages.join(', ') : 'No pages viewed yet'}</Typography>

          <Typography variant="h6" gutterBottom>Unread Pages</Typography>
          <Typography>{unreadPages.length ? unreadPages.join(', ') : 'All pages read 🎉'}</Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
}
