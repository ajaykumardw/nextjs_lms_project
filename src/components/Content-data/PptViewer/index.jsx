'use client';

import { useEffect, useRef, useState } from 'react';

export default function PptViewer({ slides = [], onPageLoad }) {
  const containerRef = useRef(null);
  const pageHeightPx = 1122;
  const totalPagesRef = useRef(slides.length || 1);
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom(z => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !slides.length) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;

      const currentPage = Math.min(
        totalPagesRef.current,
        Math.floor(scrollTop / pageHeightPx) + 1
      );

      onPageLoad?.(currentPage, totalPagesRef.current);
    };

    container.addEventListener('scroll', handleScroll);

    return () => container.removeEventListener('scroll', handleScroll);
  }, [slides, onPageLoad]);

  return (
    <div
      style={{
        height: '80vh',
        overflowY: 'auto',
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
      }}
      ref={containerRef}
    >
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', justifyContent: 'center' }}>
        <button onClick={zoomOut}>− Zoom Out</button>
        <button onClick={zoomIn}>+ Zoom In</button>
      </div>

      {slides.map((slide, index) => (
        <div key={index} style={{ minHeight: pageHeightPx, marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
          <img src={slide.url} style={{ maxHeight: pageHeightPx, width: 'auto' }} />
        </div>
      ))}
    </div>
  );
}
