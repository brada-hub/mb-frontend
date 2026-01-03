import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Maximize2, Minimize2, MapPin, Crosshair, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import 'leaflet/dist/leaflet.css';
import { useToast } from '../../context/ToastContext';

// Fix for default marker icon in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

export default function MapPicker({ value, onChange, label = "Ubicación", radius = 0 }) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    // Coordenadas por defecto (Cochabamba, Bolivia)
    const [position, setPosition] = useState(value || { lat: -17.400759, lng: -66.224411 });
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const { notify } = useToast();

    // Actualizar posición si cambia la prop value (sincronización externa cuando se edita o se obtiene ubicación)
    useEffect(() => {
        if(value) {
            setPosition(value);
        }
    }, [value]);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            notify("Tu navegador no soporta geolocalización", "error");
            return;
        }

        setIsLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(coords);
                if (onChange) onChange(coords);
                setIsLoadingLocation(false);
                notify("Ubicación actualizada correctamente", "success");
            },
            (err) => {
                console.warn("Error obteniendo ubicación:", err);
                setIsLoadingLocation(false);
                let msg = "No se pudo obtener tu ubicación.";
                if (err.code === 1) msg = "Permiso de ubicación denegado. Actívalo en tu navegador.";
                if (err.code === 2) msg = "Ubicación no disponible/señal débil.";
                if (err.code === 3) msg = "Tiempo de espera agotado al buscar ubicación.";
                notify(msg, "error");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handlePositionChange = (latlng) => {
        const coords = { lat: latlng.lat, lng: latlng.lng };
        setPosition(coords);
        if (onChange) {
            onChange(coords);
        }
    };

    const toggleFullScreen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFullScreen(!isFullScreen);
    };

    return (
        <>
            <div className="mb-6">
                <div className="w-full h-72 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col group">
                    {/* Map Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1c233a]">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); getCurrentLocation(); }}
                                className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                                title="Mi Ubicación Actual"
                            >
                                {isLoadingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                            </button>
                            <button 
                                type="button"
                                onClick={toggleFullScreen}
                                className="p-1.5 hover:bg-indigo-500 text-white bg-indigo-600 rounded-lg transition-all active:scale-90 shadow-lg shadow-indigo-600/20"
                                title="Expandir a pantalla completa"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative z-0">
                        <MapContainer 
                            center={position} 
                            zoom={15} 
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                            attributionControl={false} // OCULTA LA ATRIBUCIÓN
                            zoomControl={false}        // OCULTA EL + Y -
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker position={position} setPosition={handlePositionChange} />
                            {position && radius > 0 && (
                                <Circle 
                                    center={position} 
                                    radius={radius} 
                                    pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2 }} 
                                />
                            )}
                            <ChangeView center={position} />
                        </MapContainer>
                    </div>
                </div>
            </div>

            {/* FULL SCREEN MODAL */}
            {isFullScreen && (
                <div className="fixed inset-0 z-[2000] bg-[#0f111a] flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#161b2c]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg leading-tight">Seleccionar Ubicación Precisa</h3>
                                <p className="text-xs text-gray-400">Haz clic en el mapa para marcar el punto exacto</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                type="button"
                                onClick={() => getCurrentLocation()}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                {isLoadingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
                                <span className="font-bold text-sm hidden sm:inline">Mi Ubicación</span>
                            </button>
                            <button 
                                type="button"
                                onClick={toggleFullScreen}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 active:scale-95"
                            >
                                <Minimize2 className="w-5 h-5" />
                                <span className="font-bold text-sm">Cerrar Mapa</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 relative">
                        <MapContainer 
                            center={position} 
                            zoom={16} 
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                            attributionControl={false}
                            zoomControl={false}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker position={position} setPosition={handlePositionChange} />
                            {position && radius > 0 && (
                                <Circle 
                                    center={position} 
                                    radius={radius} 
                                    pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2 }} 
                                />
                            )}
                            <ChangeView center={position} />
                        </MapContainer>
                    </div>
                </div>
            )}
        </>
    );
}
