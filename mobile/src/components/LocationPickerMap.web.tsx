import React from 'react';

interface LocationPickerMapProps {
  coords: { latitude: number; longitude: number };
  onRegionChangeComplete: (coords: { latitude: number; longitude: number }) => void;
  mapRef?: any;
  webIframeRef: any;
}

export default function LocationPickerMap({
  webIframeRef
}: LocationPickerMapProps) {
  // Embedded HTML string for Leaflet Map View (Web Build Fallback)
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #F3F4F6; }
        .center-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -100%);
          z-index: 1000;
          pointer-events: none;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        }
        .pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgba(0, 71, 171, 0.4);
          z-index: 999;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="pulse"></div>
      <div class="center-marker">
        <!-- SVG Pin Icon -->
        <svg width="34" height="42" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 30 12 30C12 30 24 21 24 12C24 5.37 18.63 0 12 0ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="#0047AB"/>
        </svg>
      </div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([8.9475, 125.5406], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        map.on('moveend', function() {
          var center = map.getCenter();
          window.parent.postMessage({
            type: 'MAP_MOVE',
            latitude: center.lat,
            longitude: center.lng
          }, '*');
        });

        window.addEventListener('message', function(e) {
          if (e.data.type === 'SET_CENTER') {
            map.setView([e.data.latitude, e.data.longitude], 16);
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <iframe
      ref={webIframeRef}
      srcDoc={leafletHTML}
      style={{ width: '100%', height: '100%', border: 'none' }}
      title="OpenStreetMap Picker"
    />
  );
}
