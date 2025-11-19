'use client';

import { useEffect, useState } from 'react';

export default function PptViewer({ fileUrl, onPageLoad }) {
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));

  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();


        const s = document.createElement('script');
        
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });

    const loadAll = async () => {
      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
      );
      await loadScript(
        'https://cdn.jsdelivr.net/gh/meshesha/pptxjs/js/pptxjs.js'
      );

      const container = document.getElementById('ppt-content');

      window.PPTXJS.render(fileUrl, container, {
        slideMode: 'scroll',
        onSlideChange: (current, total) => onPageLoad && onPageLoad(current, total),
      });
    };

    loadAll();


  }, [fileUrl]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {/* Zoom Buttons */}
      <div style={{ marginBottom: 10 }}> <button onClick={zoomOut}>−</button> <button onClick={zoomIn}>+</button> </div>

      <div
        id="ppt-content"
        style={{
          height: '100%',
          width: '100%',
          overflowY: 'auto',
          background: '#fff',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      />
    </div>


  );
}
