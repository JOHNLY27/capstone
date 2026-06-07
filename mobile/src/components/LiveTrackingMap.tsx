import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface LiveTrackingMapProps {
  pickupCoords: { latitude: number; longitude: number };
  dropoffCoords: { latitude: number; longitude: number };
  riderCoords: { latitude: number; longitude: number; bearing?: number } | null;
}

export default function LiveTrackingMap({
  pickupCoords,
  dropoffCoords,
  riderCoords
}: LiveTrackingMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);

  // Fetch OSRM driving route geometry to render polyline
  useEffect(() => {
    let isMounted = true;
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.longitude},${pickupCoords.latitude};${dropoffCoords.longitude},${dropoffCoords.latitude}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (isMounted && data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] // Swap to [lat, lon] for Leaflet
          );
          setRouteCoords(coords);
        }
      } catch (err) {
        console.error('Failed to fetch road path geometry from OSRM:', err);
      } finally {
        if (isMounted) setIsLoadingRoute(false);
      }
    };

    fetchRoute();
    return () => {
      isMounted = false;
    };
  }, [pickupCoords, dropoffCoords]);

  // Inject rider location changes into WebView script dynamically (no reload)
  useEffect(() => {
    if (riderCoords) {
      webViewRef.current?.injectJavaScript(`
        if (window.updateRiderPosition) {
          window.updateRiderPosition(${riderCoords.latitude}, ${riderCoords.longitude}, ${riderCoords.bearing || 0});
        }
        true;
      `);
    }
  }, [riderCoords]);

  const initialRiderJS = riderCoords
    ? `setTimeout(function() { window.updateRiderPosition(${riderCoords.latitude}, ${riderCoords.longitude}, ${riderCoords.bearing || 0}); }, 300);`
    : '';

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #F3F4F6; }
        .rider-icon {
          transition: transform 0.6s ease-out, top 0.6s ease-out, left 0.6s ease-out;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Define premium custom markers
        var pickupIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        var dropoffIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        var pickupMarker = L.marker([${pickupCoords.latitude}, ${pickupCoords.longitude}], { icon: pickupIcon }).addTo(map).bindPopup("Pickup Point");
        var dropoffMarker = L.marker([${dropoffCoords.latitude}, ${dropoffCoords.longitude}], { icon: dropoffIcon }).addTo(map).bindPopup("Drop-off Point");

        var riderMarker = null;

        // Draw dotted polyline if road routing coordinates are available
        var routeCoords = ${JSON.stringify(routeCoords)};
        if (routeCoords && routeCoords.length > 0) {
          var polyline = L.polyline(routeCoords, { color: '#0047AB', weight: 5, opacity: 0.8, dashArray: '4, 10' }).addTo(map);
          map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        } else {
          var group = new L.featureGroup([pickupMarker, dropoffMarker]);
          map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }

        window.updateRiderPosition = function(lat, lng, bearing) {
          var riderSVG = \`
            <div style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35)); transform: rotate(\${bearing || 0}deg);">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#D4AF37" stroke="#050A18" stroke-width="2"/>
                <path d="M17.5 13.5c0-.83-.67-1.5-1.5-1.5h-1.5L13 9.5H9v-1h2.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H8c-.55 0-1 .45-1 1v2.5H5.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5H7v2.5c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.5h2c.83 0 1.5-.67 1.5-1.5zm-3.5-1v1h-3v-1h3z" fill="#050A18"/>
              </svg>
            </div>
          \`;

          var riderIcon = L.divIcon({
            html: riderSVG,
            className: 'rider-icon',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });

          if (!riderMarker) {
            riderMarker = L.marker([lat, lng], { icon: riderIcon }).addTo(map).bindPopup("Rider Location");
          } else {
            riderMarker.setLatLng([lat, lng]);
            riderMarker.setIcon(riderIcon);
          }

          // Readjust map window bounds to show pickup, dropoff, and active rider
          var activeMarkers = [pickupMarker, dropoffMarker, riderMarker].filter(Boolean);
          var boundGroup = new L.featureGroup(activeMarkers);
          map.fitBounds(boundGroup.getBounds(), { padding: [50, 50] });
        };

        // Render initial rider marker if available
        ${initialRiderJS}
      </script>
    </body>
    </html>
  `;

  if (isLoadingRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0047AB" />
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef}
      style={styles.webView}
      source={{ html: leafletHTML }}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  webView: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
