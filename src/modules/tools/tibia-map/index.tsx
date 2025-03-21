'use client'
import React, { useEffect, useState, useRef } from 'react'

const Maps: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/maps')
      .then(response => response.text())
      .then(data => setHtmlContent(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (htmlContent && mapContainerRef.current) {
      mapContainerRef.current.innerHTML = htmlContent

      const loadScript = (src: string) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = src
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      }

      const loadScripts = async () => {
        try {
          await loadScript('https://code.jquery.com/jquery-3.6.0.min.js')
          await loadScript(
            'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js',
          )
          await loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js')
          await loadScript('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js')
          await loadScript('/dist/map.js')

          const scripts = mapContainerRef.current?.querySelectorAll('script')
          scripts?.forEach(oldScript => {
            const newScript = document.createElement('script')
            Array.from(oldScript.attributes).forEach(attr =>
              newScript.setAttribute(attr.name, attr.value),
            )
            newScript.appendChild(document.createTextNode(oldScript.innerHTML))
            oldScript.parentNode?.replaceChild(newScript, oldScript)
          })

          window.dispatchEvent(new Event('scriptsLoaded'))
        } catch (error) {}
      }

      loadScripts()
    }
  }, [htmlContent])

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%', position: 'relative' }} />
    </div>
  )
}

export default Maps
