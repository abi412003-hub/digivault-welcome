import { useState, useEffect } from "react";
import { erpnext } from "@/lib/api";
import { useLocalStorage } from "./useLocalStorage";

export interface LocalProperty {
  id: string;
  projectId: string;
  propertyType: string;
  propertyName: string;
  address: string;
  propertySizeUnit: string;
  propertySize: string;
  doorNo: string;
  buildingName: string;
  crossRoad: string;
  mainRoad: string;
  landmark: string;
  areaName: string;
  state: string;
  zone: string;
  district: string;
  taluk: string;
  areaType: "urban" | "rural";
  municipalType: string;
  pattanaPanchayathi: string;
  urbanWard: string;
  postOffice: string;
  pincode: string;
  latitude: string;
  longitude: string;
  createdAt: string;
}

const PROPERTIES_KEY = "edigivault_properties";

export function useProperties() {
  const [localProperties, setLocalProperties] = useLocalStorage<LocalProperty[]>(PROPERTIES_KEY, []);
  const [properties, setProperties] = useState<LocalProperty[]>(localProperties);

  useEffect(() => {
    const fetchFromERPNext = async () => {
      try {
        const data = await erpnext.list(
          "DigiVault Property",
          ["name", "property_name", "property_type", "property_address", "total_area", "area_unit", "survey_number", "state", "district", "taluk", "pincode", "creation"],
          null, 50
        );
        if (data && data.length > 0) {
          const mapped = data.map((p: any) => ({
            id: p.name,
            projectId: "",
            propertyType: p.property_type || "",
            propertyName: p.property_name || p.name,
            address: p.property_address || "",
            propertySizeUnit: p.area_unit || "",
            propertySize: p.total_area || "",
            doorNo: "", buildingName: "", crossRoad: "", mainRoad: "", landmark: "", areaName: "",
            state: p.state || "Karnataka",
            zone: "", district: p.district || "", taluk: p.taluk || "",
            areaType: "urban" as const, municipalType: "", pattanaPanchayathi: "", urbanWard: "", postOffice: "",
            pincode: p.pincode || "", latitude: "", longitude: "",
            createdAt: p.creation || new Date().toISOString(),
          }));
          setProperties(mapped);
        }
      } catch {
        // fallback to local
      }
    };
    fetchFromERPNext();
  }, []);

  const addProperty = (property: Omit<LocalProperty, "id" | "createdAt">) => {
    const newProperty: LocalProperty = { ...property, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    const updated = [newProperty, ...localProperties];
    setLocalProperties(updated);
    setProperties(prev => [newProperty, ...prev]);
    return newProperty;
  };

  const getPropertiesByProject = (projectId: string) => properties.filter((p) => p.projectId === projectId);
  const updateProperty = (id: string, updates: Partial<Omit<LocalProperty, "id" | "createdAt">>) => { setProperties(properties.map((p) => (p.id === id ? { ...p, ...updates } : p))); };
  const deleteProperty = (id: string) => { setProperties(properties.filter((p) => p.id !== id)); };

  return { properties, propertyCount: properties.length, addProperty, getPropertiesByProject, updateProperty, deleteProperty };
}
