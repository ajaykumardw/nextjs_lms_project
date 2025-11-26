"use client";

import { useEffect, useRef, useState } from "react";

import { renderAsync } from "docx-preview";

export default function DocViewer({
  fileUrl,
  onPageLoad,
  setFieldData,
  pageData,
}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const wrapperRef = useRef(null); // FULLSCREEN WRAPPER

  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [viewedPages, setViewedPages] = useState(() => {
    const pages = Array.isArray(pageData?.view_page_no)
      ? pageData.view_page_no.map(Number)
      : [];

    if (!pages.includes(1)) pages.unshift(1);

    return pages;
  });

  const allowScrollEvents = useRef(false);
  const ZOOM_PAGE_HEIGHT = 1100;
  const restoreToPage = Number(pageData?.current_page_no) || 1;

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));

  // 🔵 FULLSCREEN FUNCTIONS =====================================
  const enterFullscreen = () => {
    const elem = wrapperRef.current;

    if (elem.requestFullscreen) elem.requestFullscreen();
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
  };

  // Listen to full screen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFsChange);

    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // 🔵 DOCUMENT RENDERING =====================================
  useEffect(() => {
    if (!fileUrl || !containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;

    let scrollHandler = null;
    let resizeObserver = null;

    allowScrollEvents.current = false;

    fetch(fileUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => renderAsync(buffer, content))
      .then(() => {
        resizeObserver = new ResizeObserver(() => {
          const docHeight = content.scrollHeight;
          const pages = Math.max(1, Math.round(docHeight / ZOOM_PAGE_HEIGHT));

          setTotalPages(pages);

          const scrollPage = Math.min(Math.max(restoreToPage, 1), pages);

          container.scrollTop = (scrollPage - 1) * (docHeight / pages);

          setCurrentPage(scrollPage);

          setViewedPages((prev) => {
            const arr = [...new Set(prev)];

            if (!arr.includes(scrollPage)) arr.push(scrollPage);
            if (!arr.includes(1)) arr.unshift(1);

            return arr;
          });

          setTimeout(() => {
            allowScrollEvents.current = true;
          }, 300);

          onPageLoad?.(scrollPage, pages);
        });

        resizeObserver.observe(content);

        scrollHandler = () => {
          if (!allowScrollEvents.current) return;

          const docHeight = content.scrollHeight;
          const pages = Math.max(1, Math.round(docHeight / ZOOM_PAGE_HEIGHT));
          const pageHeight = docHeight / pages;

          let newPage;

          if (container.scrollTop <= 2) newPage = 1;
          else if (
            container.scrollTop + container.clientHeight >=
            docHeight - 2
          )
            newPage = pages;
          else
            newPage = Math.min(
              pages,
              Math.max(1, Math.floor(container.scrollTop / pageHeight) + 1)
            );

          if (newPage !== currentPage) {
            setCurrentPage(newPage);

            setViewedPages((prev) => {
              const arr = [...new Set(prev)];

              if (!arr.includes(newPage)) arr.push(newPage);
              if (!arr.includes(1)) arr.unshift(1);

              return arr;
            });

            onPageLoad?.(newPage, pages);
          }
        };

        container.addEventListener("scroll", scrollHandler);
      });

    return () => {
      if (scrollHandler) container.removeEventListener("scroll", scrollHandler);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [fileUrl]);

  // Sync
  useEffect(() => {
    setFieldData?.((prev) => ({ ...prev, currentPage }));
  }, [currentPage]);

  useEffect(() => {
    setFieldData?.((prev) => ({ ...prev, totalPages }));
  }, [totalPages]);

  useEffect(() => {
    setFieldData?.((prev) => ({ ...prev, viewedPages }));
  }, [viewedPages]);

  // ===============================================================

  return (
    <div
      ref={wrapperRef}
      style={{
        height: "100%",
        width: "100%",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TOP TOOLBAR */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: 10,
          background: "#f0f0f0",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button onClick={zoomOut}>-</button>
        <button onClick={zoomIn}>+</button>

        {/* FULLSCREEN BUTTONS */}
        {!isFullscreen && (
          <button onClick={enterFullscreen}>Full Screen</button>
        )}

        {isFullscreen && (
          <button onClick={exitFullscreen}>Exit Full Screen</button>
        )}
      </div>

      {/* DOC VIEWPORT */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 10,
          background: "#ffffff",
        }}
      >
        <div
          ref={contentRef}
          style={{
            zoom,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}
