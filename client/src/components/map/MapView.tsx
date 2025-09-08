import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

interface MapViewProps {
  coordinates: [number, number]; // [latitude, longitude]
   className?: string;
}

const MapView = ({ coordinates,className }: MapViewProps) => {
  return (
    <MapContainer  center={coordinates} zoom={14} scrollWheelZoom={false} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className={className}
      />
      <Marker position={coordinates}>
        <Popup>Task Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;