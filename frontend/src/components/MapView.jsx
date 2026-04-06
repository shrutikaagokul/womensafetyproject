import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./Map.css";

// 🔧 Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

function MapView() {
    const [markers, setMarkers] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const mapRef = useRef();

    // 🌐 Fetch backend data
    useEffect(() => {
        fetch("http://127.0.0.1:5000/map-data")
            .then((res) => res.json())
            .then((data) => setMarkers(data))
            .catch((err) => console.error(err));
    }, []);

    // 📍 Get user location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            },
            (err) => console.error(err)
        );
    }, []);

    // 🧩 Fix tile glitch
    useEffect(() => {
        if (mapRef.current) {
            setTimeout(() => {
                mapRef.current.invalidateSize();
            }, 200);
        }
    }, []);

    // 🎨 Color markers
    const getIcon = (severity) => {
        let color =
            severity === "High"
                ? "red"
                : severity === "Medium"
                    ? "yellow"
                    : "green";

        return new L.Icon({
            iconUrl: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
            iconSize: [32, 32]
        });
    };

    return (
        <div className="map-page">

            {/* ✨ Header */}
            <div className="map-header">
                <h1>Safety Map</h1>
                <p>Real-time incident tracking around you</p>
            </div>

            {/* 📊 Legend */}
            <div className="map-legend">
                <h4>Risk Levels</h4>
                <div className="legend-item">
                    <div className="legend-dot red"></div> High
                </div>
                <div className="legend-item">
                    <div className="legend-dot yellow"></div> Medium
                </div>
                <div className="legend-item">
                    <div className="legend-dot green"></div> Low
                </div>
            </div>

            {/* 🗺️ Map */}
            <div className="map-container">
                <MapContainer
                    center={
                        userLocation
                            ? [userLocation.lat, userLocation.lng]
                            : [13.0827, 80.2707]
                    }
                    zoom={13}
                    whenCreated={(map) => (mapRef.current = map)}
                    className="leaflet-map"
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* 🚨 Backend markers */}
                    {markers.map((m, i) => (
                        <Marker
                            key={i}
                            position={[m.lat, m.lng]}
                            icon={getIcon(m.severity)}
                        >
                            <Popup>
                                <div className="popup">
                                    <h3>🚨 Incident</h3>
                                    <p><strong>Severity:</strong> {m.severity}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* 📍 User marker */}
                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]}>
                            <Popup>📍 You are here</Popup>
                        </Marker>
                    )}

                </MapContainer>
            </div>

        </div>
    );
}

export default MapView;