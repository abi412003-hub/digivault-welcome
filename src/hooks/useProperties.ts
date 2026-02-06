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
  const [properties, setProperties] = useLocalStorage<LocalProperty[]>(PROPERTIES_KEY, []);

  const addProperty = (property: Omit<LocalProperty, "id" | "createdAt">) => {
    const newProperty: LocalProperty = {
      ...property,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProperties([newProperty, ...properties]);
    return newProperty;
  };

  const getPropertiesByProject = (projectId: string) => {
    return properties.filter((p) => p.projectId === projectId);
  };

  const updateProperty = (id: string, updates: Partial<Omit<LocalProperty, "id" | "createdAt">>) => {
    setProperties(
      properties.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  return {
    properties,
    propertyCount: properties.length,
    addProperty,
    getPropertiesByProject,
    updateProperty,
    deleteProperty,
  };
}
