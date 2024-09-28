'use client';

import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/layout';

const GulpHtmlPage: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/maps')
      .then(response => response.text())
      .then(data => setHtmlContent(data))
      .catch(error => console.error('Error fetching HTML:', error));
  }, []);

  useEffect(() => {
    if (htmlContent && containerRef.current) {
      containerRef.current.innerHTML = htmlContent;

      const loadScript = (src: string) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      };

      const loadScripts = async () => {
        try {
          await loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
          await loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js');
          await loadScript('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js');
          await loadScript('dist/map.js');

          const scripts = containerRef.current?.querySelectorAll('script');
          scripts?.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr =>
              newScript.setAttribute(attr.name, attr.value)
            );
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode?.replaceChild(newScript, oldScript);
          });

          window.dispatchEvent(new Event('htmlContentLoaded'));
        } catch (error) {
          console.error('Error loading scripts:', error);
        }
      };

      loadScripts();
    }
  }, [htmlContent]);

  return (
    <DashboardLayout>
      <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div ref={containerRef} style={{ height: '70vh', width: '70%', position: 'relative' }} />
      </div>
    </DashboardLayout>
  );
};

export default GulpHtmlPage;