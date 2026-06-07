import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface LocationPickerMapProps {
  coords: { latitude: number; longitude: number };
  onRegionChangeComplete: (coords: { latitude: number; longitude: number }) => void;
  mapRef: any;
  webIframeRef?: any;
}

export default function LocationPickerMap({
  coords,
  onRegionChangeComplete,
  mapRef
}: LocationPickerMapProps) {
  const webViewRef = useRef<WebView>(null);
  const initialCoords = useRef(coords).current;

  // Expose the animateToRegion method to the parent via the mapRef prop
  useEffect(() => {
    if (mapRef) {
      mapRef.current = {
        animateToRegion: (region: { latitude: number; longitude: number }) => {
          webViewRef.current?.injectJavaScript(`
            if (window.setMapCenter) {
              window.setMapCenter(${region.latitude}, ${region.longitude});
            }
            true;
          `);
        }
      };
    }
  }, [mapRef]);

  // Handle onload event to make sure map centers on initial coords if needed
  const handleLoadEnd = () => {
    webViewRef.current?.injectJavaScript(`
      if (window.setMapCenter) {
        window.setMapCenter(${coords.latitude}, ${coords.longitude});
      }
      true;
    `);
  };

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
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Start with the initial coordinates
        var map = L.map('map', { zoomControl: false }).setView([${initialCoords.latitude}, ${initialCoords.longitude}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        map.on('moveend', function() {
          var center = map.getCenter();
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MAP_MOVE',
              latitude: center.lat,
              longitude: center.lng
            }));
          }
        });

        window.setMapCenter = function(lat, lng) {
          map.setView([lat, lng], 16);
        };
      </script>
    </body>
    </html>
  `;


  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.type === 'MAP_MOVE') {
        onRegionChangeComplete({
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
    } catch (e) {
      console.warn('Failed to parse WebView message:', e);
    }
  };

  return (
    <WebView
      ref={webViewRef}
      style={styles.webView}
      source={{ html: leafletHTML }}
      originWhitelist={['*']}
      onMessage={handleMessage}
      onLoadEnd={handleLoadEnd}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  webView: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
});

