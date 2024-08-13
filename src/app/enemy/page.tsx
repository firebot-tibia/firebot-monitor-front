'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/dashboard';

const GulpHtmlPage: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    fetch('/api/maps')
      .then(response => response.text())
      .then(data => setHtmlContent(data))
      .catch(error => console.error('Error fetching HTML:', error));
  }, []);

  useEffect(() => {
    if (htmlContent) {
      const container = document.getElementById('map-container');
      if (container) {
        container.innerHTML = htmlContent;

        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr =>
            newScript.setAttribute(attr.name, attr.value)
          );
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });
      }
    }
  }, [htmlContent]);

  return (
    <>
      <DashboardLayout>
      <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div id="map-container" style={{ height: '70vh', width: '70%', position: 'relative' }} />
      </div>
      </DashboardLayout>
    </>
  );
};

export default GulpHtmlPage;
