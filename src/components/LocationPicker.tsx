import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { LatLng, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Fix for default marker icon in react-leaflet
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLat?: string;
  initialLng?: string;
  onLocationSelect: (lat: string, lng: string) => void;
}

// Component to handle map click events
function LocationMarker({
  position,
  setPosition,
}: {
  position: LatLng | null;
  setPosition: (pos: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={defaultIcon} /> : null;
}

// Component to recenter map
function RecenterButton({ position }: { position: LatLng | null }) {
  const map = useMap();

  const handleRecenter = () => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  };

  if (!position) return null;

  return (
    <button
      onClick={handleRecenter}
      className="absolute top-20 right-3 z-[1000] bg-background border border-border rounded-lg p-2 shadow-md hover:bg-muted transition-colors"
      type="button"
    >
      <Navigation className="w-5 h-5" />
    </button>
  );
}

// Component to get current location
function CurrentLocationButton({
  onLocationFound,
  isLocating,
  setIsLocating,
}: {
  onLocationFound: (latlng: LatLng) => void;
  isLocating: boolean;
  setIsLocating: (v: boolean) => void;
}) {
  const map = useMap();

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = new LatLng(pos.coords.latitude, pos.coords.longitude);
        onLocationFound(latlng);
        map.setView(latlng, 16);
        setIsLocating(false);
        toast.success("Current location found!");
      },
      (error) => {
        setIsLocating(false);
        toast.error("Unable to get current location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <button
      onClick={handleGetCurrentLocation}
      disabled={isLocating}
      className="absolute top-3 right-3 z-[1000] bg-background border border-border rounded-lg p-2 shadow-md hover:bg-muted transition-colors disabled:opacity-50"
      type="button"
    >
      {isLocating ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <MapPin className="w-5 h-5" />
      )}
    </button>
  );
}

export function LocationPicker({
  open,
  onOpenChange,
  initialLat,
  initialLng,
  onLocationSelect,
}: LocationPickerProps) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Default center (Bangalore, India)
  const defaultCenter: [number, number] = [12.9716, 77.5946];

  useEffect(() => {
    if (open) {
      if (initialLat && initialLng) {
        setPosition(new LatLng(parseFloat(initialLat), parseFloat(initialLng)));
      } else {
        setPosition(null);
      }
    }
  }, [open, initialLat, initialLng]);

  const handleConfirm = () => {
    if (position) {
      onLocationSelect(position.lat.toFixed(6), position.lng.toFixed(6));
      onOpenChange(false);
      toast.success("Location selected!");
    } else {
      toast.error("Please select a location on the map");
    }
  };

  const center: [number, number] = position
    ? [position.lat, position.lng]
    : defaultCenter;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-lg h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Select Location
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative px-4">
          <div className="h-full w-full rounded-xl overflow-hidden border border-border">
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
              <CurrentLocationButton
                onLocationFound={setPosition}
                isLocating={isLocating}
                setIsLocating={setIsLocating}
              />
              <RecenterButton position={position} />
            </MapContainer>
          </div>
        </div>

        <div className="p-4 pt-2 space-y-3">
          {position && (
            <div className="text-sm text-muted-foreground text-center">
              Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Tap on the map to select location or use the pin button for current location
          </p>
        </div>

        <DialogFooter className="p-4 pt-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1" disabled={!position}>
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
