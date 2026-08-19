import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Play,
  Square,
  Pause,
  Compass,
  Navigation,
  Crosshair,
  MapPin,
  Clock,
  Gauge,
  TrendingUp,
  Download,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  Mountain,
  Layers,
  RotateCcw,
  Share2,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Vehicle,
  Language,
  GPSPoint,
  SavedRoute,
  RideLog,
} from '../types';
import { translations } from '../translations';
import { AppStorage } from '../utils/storage';

interface TrackingViewProps {
  vehicle: Vehicle;
  currentLanguage: Language;
  onRideLogged?: (log: RideLog) => void;
  onUpdateVehicleOdometer?: (kmToAdd: number) => void;
}

// Haversine distance calculator in KM
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  vehicle,
  currentLanguage,
  onRideLogged,
  onUpdateVehicleOdometer,
}) => {
  const t = translations[currentLanguage];

  // Tracking States
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [followMode, setFollowMode] = useState<boolean>(true);
  const [tileMode, setTileMode] = useState<'voyager' | 'dark' | 'osm'>('voyager');

  // Real-time Ride Data
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([31.5204, 74.3587]);
  const [heading, setHeading] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [currentAltitude, setCurrentAltitude] = useState<number>(215);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(5);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'active' | 'paused'>('idle');
  const [routePoints, setRoutePoints] = useState<GPSPoint[]>([]);

  // Trip Statistics
  const [tripDistanceKm, setTripDistanceKm] = useState<number>(0);
  const [tripSeconds, setTripSeconds] = useState<number>(0);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState<number>(0);
  const [startVoltage, setStartVoltage] = useState<number>(vehicle.currentVoltage || 76.5);
  const [currentSimVoltage, setCurrentSimVoltage] = useState<number>(vehicle.currentVoltage || 76.5);

  // Saved Routes
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [activeLoadedRouteId, setActiveLoadedRouteId] = useState<string | null>(null);

  // Save Modal
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveRouteName, setSaveRouteName] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Simulation interval ref & watchId ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const scooterMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved routes from storage
  useEffect(() => {
    setSavedRoutes(AppStorage.getRoutes());
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Lahore, Pakistan or user location
      const map = L.map(mapContainerRef.current, {
        center: [31.5204, 74.3587],
        zoom: 14,
        zoomControl: false,
      });

      // Custom Tile Layer
      const getTileUrl = (mode: string) => {
        if (mode === 'dark') {
          return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        }
        if (mode === 'osm') {
          return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      };

      const tileLayer = L.tileLayer(getTileUrl(tileMode), {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Custom Scooter Marker Icon with Pulse
      const scooterIcon = L.divIcon({
        className: 'custom-scooter-marker',
        html: `
          <div class="relative flex items-center justify-center w-12 h-12">
            <div class="absolute w-10 h-10 bg-sky-500/20 rounded-full animate-ping"></div>
            <div class="w-9 h-9 bg-slate-900 border-2 border-sky-400 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.8)] flex items-center justify-center text-white">
              <svg class="w-5 h-5 text-sky-400 transform -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
              </svg>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const marker = L.marker([31.5204, 74.3587], { icon: scooterIcon }).addTo(map);
      scooterMarkerRef.current = marker;

      // Polyline for Route
      const polyline = L.polyline([], {
        color: '#0ea5e9',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routePolylineRef.current = polyline;

      mapInstanceRef.current = map;

      // Automatically detect real user coordinates via browser Geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            const newPos: [number, number] = [latitude, longitude];
            setCurrentPosition(newPos);
            setGpsAccuracy(Math.round(accuracy));
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView(newPos, 15);
            }
            if (scooterMarkerRef.current) {
              scooterMarkerRef.current.setLatLng(newPos);
            }
          },
          (err) => {
            console.warn('Initial geolocation detection:', err);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    }

    return () => {
      // Map cleanup on unmount handled gracefully
    };
  }, []);

  // Update Tile Layer when tileMode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (tileMode === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (tileMode === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    L.tileLayer(url, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [tileMode]);

  // Update Route Polyline & Marker when routePoints change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const latLngs = routePoints.map((pt) => [pt.lat, pt.lng] as [number, number]);
    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs(latLngs);
    }

    if (routePoints.length > 0) {
      const lastPoint = routePoints[routePoints.length - 1];
      const pos: [number, number] = [lastPoint.lat, lastPoint.lng];
      setCurrentPosition(pos);

      if (scooterMarkerRef.current) {
        scooterMarkerRef.current.setLatLng(pos);
      }

      if (followMode && mapInstanceRef.current) {
        mapInstanceRef.current.panTo(pos, { animate: true, duration: 0.5 });
      }
    }
  }, [routePoints, followMode]);

  // Trip Timer
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setTripSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTracking, isPaused]);

  // Start Real Device Geolocation Tracking
  const startLiveGPSTracking = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError(t.gps_permission_denied);
      return;
    }

    setIsTracking(true);
    setIsPaused(false);
    setGpsStatus('searching');
    setStartVoltage(vehicle.currentVoltage || 76.5);
    setCurrentSimVoltage(vehicle.currentVoltage || 76.5);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading: gpsHeading, altitude, accuracy } = position.coords;
        const speedKmh = speed ? Math.round(speed * 3.6) : 0;
        const alt = altitude ? Math.round(altitude) : 215;

        setGpsStatus('active');
        setCurrentSpeedKmh(speedKmh);
        setMaxSpeedKmh((prev) => Math.max(prev, speedKmh));
        setCurrentAltitude(alt);
        setGpsAccuracy(Math.round(accuracy));
        if (gpsHeading !== null && !isNaN(gpsHeading)) setHeading(gpsHeading);

        const newPoint: GPSPoint = {
          lat: latitude,
          lng: longitude,
          timestamp: Date.now(),
          speedKmh,
          altitude: alt,
          accuracy: Math.round(accuracy),
          voltage: Math.max(
            vehicle.cutoffVoltage,
            Number((startVoltage - tripDistanceKm * 0.18).toFixed(1))
          ),
        };

        setRoutePoints((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const dist = calculateDistanceKm(last.lat, last.lng, latitude, longitude);
            if (dist > 0.002) {
              setTripDistanceKm((d) => Number((d + dist).toFixed(2)));
              return [...prev, newPoint];
            }
            return prev;
          }
          return [newPoint];
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setGpsStatus('idle');
        setGeoError(t.gps_permission_denied);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    watchIdRef.current = watchId;
  };

  // Pause / Resume Tracking
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setGpsStatus('active');
    } else {
      setIsPaused(true);
      setGpsStatus('paused');
    }
  };

  // Stop Tracking & Open Save Dialog
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }

    setIsTracking(false);
    setIsPaused(false);
    setGpsStatus('idle');

    if (routePoints.length > 1 || tripDistanceKm > 0.1) {
      setSaveRouteName(
        `${vehicle.nickname || vehicle.model} Trip - ${new Date().toLocaleDateString()}`
      );
      setShowSaveModal(true);
    }
  };

  // Real browser geolocation position fetcher
  const handleDetectLivePosition = () => {
    if (!navigator.geolocation) {
      setGeoError('Browser does not support Geolocation API.');
      return;
    }
    setGpsStatus('searching');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy, altitude } = pos.coords;
        const newPos: [number, number] = [latitude, longitude];
        setCurrentPosition(newPos);
        setGpsAccuracy(Math.round(accuracy));
        if (altitude) setCurrentAltitude(Math.round(altitude));
        setGpsStatus('idle');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(newPos, 16);
        }
        if (scooterMarkerRef.current) {
          scooterMarkerRef.current.setLatLng(newPos);
        }
      },
      (err) => {
        setGpsStatus('idle');
        setGeoError(err.message || 'Could not retrieve GPS coordinates.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Save Route to Storage & Ride Logs
  const handleSaveRoute = () => {
    if (!saveRouteName.trim()) return;

    const avgSpeed =
      tripSeconds > 0
        ? Math.round((tripDistanceKm / (tripSeconds / 3600)) * 10) / 10
        : 35;

    const endVolt = Number(
      (startVoltage - (tripDistanceKm * 0.2 || 1.2)).toFixed(1)
    );

    const newSavedRoute: SavedRoute = {
      id: `route_${Date.now()}`,
      vehicleId: vehicle.id,
      name: saveRouteName,
      date: new Date().toISOString(),
      points: routePoints,
      distanceKm: tripDistanceKm,
      durationSeconds: tripSeconds,
      avgSpeedKmh: avgSpeed,
      maxSpeedKmh: maxSpeedKmh || 45,
      elevationGainMeters: 18,
      startVoltage,
      endVoltage: endVolt,
    };

    // Save to AppStorage
    AppStorage.addRoute(newSavedRoute);
    setSavedRoutes(AppStorage.getRoutes());

    // Also push to Ride Log
    if (onRideLogged) {
      const newRideLog: RideLog = {
        id: `ride_${Date.now()}`,
        vehicleId: vehicle.id,
        dateTime: new Date().toISOString(),
        distanceKm: tripDistanceKm,
        durationMinutes: Math.max(1, Math.round(tripSeconds / 60)),
        startVoltage,
        endVoltage: endVolt,
        rideMode: 'NORMAL',
        passengerLoad: 'SINGLE',
        terrain: 'FLAT',
        energyUsedUnits: Number(((tripDistanceKm * 28) / 1000).toFixed(2)),
        notes: `GPS Tracked Route: ${saveRouteName}`,
        avgSpeedKmh: avgSpeed,
      };
      onRideLogged(newRideLog);
    }

    if (onUpdateVehicleOdometer) {
      onUpdateVehicleOdometer(tripDistanceKm);
    }

    setSaveSuccessMsg('Route & Ride Log successfully saved!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setShowSaveModal(false);
    }, 1500);
  };

  // Load a Saved Route on Map
  const loadSavedRoute = (route: SavedRoute) => {
    setActiveLoadedRouteId(route.id);
    setRoutePoints(route.points);
    setTripDistanceKm(route.distanceKm);
    setTripSeconds(route.durationSeconds);
    setMaxSpeedKmh(route.maxSpeedKmh);

    if (mapInstanceRef.current && route.points.length > 0) {
      const bounds = L.latLngBounds(route.points.map((p) => [p.lat, p.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  // Delete a Saved Route
  const handleDeleteRoute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    AppStorage.deleteRoute(id);
    setSavedRoutes(AppStorage.getRoutes());
    if (activeLoadedRouteId === id) {
      setActiveLoadedRouteId(null);
      setRoutePoints([]);
      setTripDistanceKm(0);
    }
  };

  // Center Map on Scooter Position
  const centerMapOnScooter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(currentPosition, 16, { animate: true });
    }
  };

  // Export GPX File
  const exportGPX = (route: SavedRoute) => {
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="EV Tracker PK">\n  <metadata>\n    <name>${route.name}</name>\n    <time>${route.date}</time>\n  </metadata>\n  <trk>\n    <name>${route.name}</name>\n    <trkseg>\n`;
    route.points.forEach((pt) => {
      gpx += `      <trkpt lat="${pt.lat}" lon="${pt.lng}">\n        <ele>${pt.altitude || 215}</ele>\n        <time>${new Date(pt.timestamp).toISOString()}</time>\n      </trkpt>\n`;
    });
    gpx += `    </trkseg>\n  </trk>\n</gpx>`;

    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${route.name.replace(/\s+/g, '_')}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export GeoJSON File
  const exportGeoJSON = (route: SavedRoute) => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: route.name,
            distanceKm: route.distanceKm,
            durationSeconds: route.durationSeconds,
            avgSpeedKmh: route.avgSpeedKmh,
            vehicle: vehicle.model,
          },
          geometry: {
            type: 'LineString',
            coordinates: route.points.map((pt) => [pt.lng, pt.lat, pt.altitude || 0]),
          },
        },
      ],
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${route.name.replace(/\s+/g, '_')}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format Elapsed Time
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Savings during this trip in PKR
  const tripPkrSaved = Math.round(tripDistanceKm * 6.4);

  // Speed & Altitude chart data
  const chartData = routePoints.map((pt, idx) => ({
    name: `${idx + 1}`,
    speed: pt.speedKmh || 0,
    altitude: pt.altitude || 215,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></div>
            <span className="text-[11px] font-bold tracking-widest text-sky-400 uppercase">
              GPS Telemetry & Route Navigator
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {t.live_tracking_title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {vehicle.nickname || `${vehicle.brand} ${vehicle.model}`} • {vehicle.nominalVoltage}V {vehicle.batteryChemistry.replace('_', ' ')}
          </p>
        </div>

        {/* GPS Live Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                gpsStatus === 'active'
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-ping'
                  : gpsStatus === 'searching'
                  ? 'bg-amber-400 animate-pulse'
                  : gpsStatus === 'paused'
                  ? 'bg-amber-500'
                  : 'bg-slate-600'
              }`}
            ></div>
            <span className="font-mono text-slate-300">
              {gpsStatus === 'active'
                ? t.gps_status_active
                : gpsStatus === 'searching'
                ? t.gps_status_searching
                : gpsStatus === 'paused'
                ? t.gps_status_paused
                : t.gps_status_idle}
            </span>
          </div>
        </div>
      </div>

      {geoError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <div className="flex-1">{geoError}</div>
          <button
            onClick={() => setGeoError(null)}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Map & HUD Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Top 8-Cols: Interactive GPS Map */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative w-full h-[380px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            {/* Leaflet Map Div */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Map Controls Floating Overlay */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button
                onClick={centerMapOnScooter}
                title={t.center_on_scooter}
                className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-sky-400 shadow-lg flex items-center justify-center backdrop-blur-sm transition active:scale-95"
              >
                <Crosshair className="w-5 h-5" />
              </button>

              <button
                onClick={() => setFollowMode(!followMode)}
                title={followMode ? t.follow_mode_on : t.follow_mode_off}
                className={`w-10 h-10 rounded-xl border shadow-lg flex items-center justify-center backdrop-blur-sm transition active:scale-95 ${
                  followMode
                    ? 'bg-sky-500 text-white border-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.4)]'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Navigation className="w-5 h-5" />
              </button>

              <button
                onClick={() =>
                  setTileMode((m) => (m === 'voyager' ? 'dark' : m === 'dark' ? 'osm' : 'voyager'))
                }
                title="Toggle Map Style"
                className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 shadow-lg flex items-center justify-center backdrop-blur-sm transition active:scale-95 text-xs font-bold"
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>

            {/* HUD Speed & Heading Badge on Map */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-sky-400" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Speed</div>
                  <div className="text-xl font-black text-white font-mono leading-none">
                    {currentSpeedKmh} <span className="text-xs text-sky-400 font-normal">km/h</span>
                  </div>
                </div>
              </div>

              <div className="h-7 w-px bg-slate-800"></div>

              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Distance</div>
                <div className="text-xl font-black text-emerald-400 font-mono leading-none">
                  {tripDistanceKm} <span className="text-xs text-slate-400 font-normal">km</span>
                </div>
              </div>

              <div className="h-7 w-px bg-slate-800 hidden sm:block"></div>

              <div className="hidden sm:block">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Time</div>
                <div className="text-base font-bold text-slate-200 font-mono leading-none">
                  {formatTime(tripSeconds)}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Ride Control Action Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {!isTracking ? (
                <button
                  onClick={startLiveGPSTracking}
                  className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-[0_4px_16px_rgba(14,165,233,0.4)] transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {t.start_tracking}
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition active:scale-95 ${
                      isPaused
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {isPaused ? t.resume_tracking : t.pause_tracking}
                  </button>

                  <button
                    onClick={stopTracking}
                    className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-[0_4px_16px_rgba(225,29,72,0.3)] transition active:scale-95"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    {t.stop_tracking}
                  </button>
                </>
              )}
            </div>

            {/* Live GPS Coordinate Detection */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDetectLivePosition}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-sky-500/30 text-sky-400 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Locate My GPS Position</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 4-Cols: Telemetry Dashboard & Route Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Digital Cockpit Meter */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Cockpit Telemetry
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                ±{gpsAccuracy}m Accuracy
              </span>
            </div>

            {/* Large Speedometer Readout */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 text-center relative">
              <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                {currentSpeedKmh}
              </div>
              <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mt-1">
                KILOMETERS PER HOUR (KM/H)
              </div>

              {/* Dynamic Speed Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-emerald-400 to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentSpeedKmh / 70) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold mb-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  {t.trip_duration}
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {formatTime(tripSeconds)}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  {t.max_speed}
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {maxSpeedKmh} <span className="text-xs text-slate-500">km/h</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold mb-1">
                  <Mountain className="w-3.5 h-3.5 text-amber-400" />
                  {t.altitude_m}
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {currentAltitude} <span className="text-xs text-slate-500">m</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold mb-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  Est. Voltage
                </div>
                <div className="text-lg font-bold text-yellow-400 font-mono">
                  {currentSimVoltage.toFixed(1)} <span className="text-xs text-slate-500">V</span>
                </div>
              </div>
            </div>

            {/* Trip PKR Savings Card */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  ₨
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Trip Fuel Savings
                  </div>
                  <div className="text-base font-black text-white">
                    Rs. {tripPkrSaved} saved
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-lg">
                ~₨6.4/km
              </span>
            </div>
          </div>

          {/* Elevation & Speed Graph Profile */}
          {chartData.length > 2 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                {t.elevation_profile}
              </h4>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="speed"
                      name="Speed (km/h)"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#speedGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Routes Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              {t.route_history_title}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {savedRoutes.length} routes recorded
          </span>
        </div>

        {savedRoutes.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-2">
            <Compass className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {t.no_saved_routes}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedRoutes.map((rt) => (
              <div
                key={rt.id}
                onClick={() => loadSavedRoute(rt)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  activeLoadedRouteId === rt.id
                    ? 'bg-slate-950 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{rt.name}</h4>
                    <span className="text-[10px] text-sky-400 font-mono">
                      {new Date(rt.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60">
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold">Distance</div>
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        {rt.distanceKm} km
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold">Duration</div>
                      <div className="text-xs font-bold text-slate-200 font-mono">
                        {formatTime(rt.durationSeconds)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold">Avg Speed</div>
                      <div className="text-xs font-bold text-sky-400 font-mono">
                        {rt.avgSpeedKmh} km/h
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportGPX(rt);
                      }}
                      title={t.export_gpx}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition"
                    >
                      GPX
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportGeoJSON(rt);
                      }}
                      title={t.export_geojson}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition"
                    >
                      GeoJSON
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleDeleteRoute(rt.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Route Dialog Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {t.save_route_dialog_title}
                </h3>
                <p className="text-xs text-slate-400">
                  {tripDistanceKm} km in {formatTime(tripSeconds)}
                </p>
              </div>
            </div>

            {saveSuccessMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold text-center">
                {saveSuccessMsg}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {t.route_name_label}
                  </label>
                  <input
                    type="text"
                    value={saveRouteName}
                    onChange={(e) => setSaveRouteName(e.target.value)}
                    placeholder={t.route_name_placeholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-sky-500 outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Odometer Addition:</span>
                    <span className="font-bold text-white">+{tripDistanceKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Fuel Money Saved:</span>
                    <span className="font-bold text-emerald-400">Rs. {tripPkrSaved}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveRoute}
                    className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition shadow-[0_4px_12px_rgba(14,165,233,0.3)]"
                  >
                    {t.save_to_logs_confirm}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
