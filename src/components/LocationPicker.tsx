import { useState, useEffect, useRef } from "react";
import L from "leaflet";
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

// Fix for default marker icon
const defaultIcon = L.icon({
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

export function LocationPicker({
  open,
  onOpenChange,
  initialLat,
  initialLng,
  onLocationSelect,
}: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Default center (Bangalore, India)
  const defaultCenter: [number, number] = [12.9716, 77.5946];

  // Initialize map when dialog opens
  useEffect(() => {
    if (open && containerRef.current && !mapRef.current) {
      // Small delay to ensure container is properly sized
      const timer = setTimeout(() => {
        if (!containerRef.current) return;
        
        const initialCenter = initialLat && initialLng 
          ? [parseFloat(initialLat), parseFloat(initialLng)] as [number, number]
          : defaultCenter;

        const map = L.map(containerRef.current, {
          center: initialCenter,
          zoom: 13,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Add zoom control to bottom right
        L.control.zoom({ position: "bottomleft" }).addTo(map);

        // Add click handler
        map.on("click", (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setPosition({ lat, lng });
          
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
          }
        });

        // Set initial marker if we have initial coords
        if (initialLat && initialLng) {
          const lat = parseFloat(initialLat);
          const lng = parseFloat(initialLng);
          setPosition({ lat, lng });
          markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
        }

        mapRef.current = map;
        setMapReady(true);

        // Invalidate size after render
        setTimeout(() => map.invalidateSize(), 100);
      }, 150);

      return () => clearTimeout(timer);
    }

    // Cleanup when dialog closes
    if (!open && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapReady(false);
      setPosition(null);
    }
  }, [open, initialLat, initialLng]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
        
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
          
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(mapRef.current);
          }
        }
        
        setIsLocating(false);
        toast.success("Current location found!");
      },
      () => {
        setIsLocating(false);
        toast.error("Unable to get current location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRecenter = () => {
    if (position && mapRef.current) {
      mapRef.current.setView([position.lat, position.lng], mapRef.current.getZoom());
    }
  };

  const handleConfirm = () => {
    if (position) {
      onLocationSelect(position.lat.toFixed(6), position.lng.toFixed(6));
      onOpenChange(false);
      toast.success("Location selected!");
    } else {
      toast.error("Please select a location on the map");
    }
  };

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
          <div className="h-full w-full rounded-xl overflow-hidden border border-border relative">
            <div ref={containerRef} className="h-full w-full" />
            
            {!mapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Custom controls */}
            {mapReady && (
              <>
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

                {position && (
                  <button
                    onClick={handleRecenter}
                    className="absolute top-14 right-3 z-[1000] bg-background border border-border rounded-lg p-2 shadow-md hover:bg-muted transition-colors"
                    type="button"
                  >
                    <Navigation className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
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
