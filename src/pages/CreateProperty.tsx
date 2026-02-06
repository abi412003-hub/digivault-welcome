import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProperties } from "@/hooks/useProperties";
import { toast } from "sonner";
import { LocationPicker } from "@/components/LocationPicker";

interface PropertyForm {
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
}

const CreateProperty = () => {
  const navigate = useNavigate();
  const { addProperty } = useProperties();

  // Get current project from localStorage
  const [currentProject, setCurrentProject] = useState<{ id: string; title: string } | null>(null);
  const [projectRefId, setProjectRefId] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("currentProject");
    if (stored) {
      const project = JSON.parse(stored);
      setCurrentProject(project);
      // Generate reference ID based on project id or random
      const refNum = Math.floor(100000 + Math.random() * 900000);
      setProjectRefId(`PR-${refNum}`);
    }
  }, []);

  const [form, setForm] = useState<PropertyForm>({
    propertyType: "",
    propertyName: "",
    address: "",
    propertySizeUnit: "",
    propertySize: "",
    doorNo: "",
    buildingName: "",
    crossRoad: "",
    mainRoad: "",
    landmark: "",
    areaName: "",
    state: "",
    zone: "",
    district: "",
    taluk: "",
    areaType: "urban",
    municipalType: "",
    pattanaPanchayathi: "",
    urbanWard: "",
    postOffice: "",
    pincode: "",
    latitude: "",
    longitude: "",
  });

  // Generate formatted address review
  const formattedAddress = useMemo(() => {
    const parts = [
      form.doorNo,
      form.buildingName,
      form.crossRoad,
      form.mainRoad && `near ${form.landmark}`,
      form.areaName,
      form.municipalType,
      form.urbanWard,
      form.taluk,
      form.district,
      form.zone,
      form.state?.toUpperCase(),
      form.pincode,
    ].filter(Boolean);
    return parts.join(", ");
  }, [
    form.doorNo,
    form.buildingName,
    form.crossRoad,
    form.mainRoad,
    form.landmark,
    form.areaName,
    form.municipalType,
    form.urbanWard,
    form.taluk,
    form.district,
    form.zone,
    form.state,
    form.pincode,
  ]);

  const updateForm = (field: keyof PropertyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    navigate("/projects/create");
  };

  const handleSelectLocation = () => {
    setShowLocationPicker(true);
  };

  const handleLocationSelect = (lat: string, lng: string) => {
    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleNext = () => {
    if (!currentProject) {
      toast.error("No project found. Please create a project first.");
      return;
    }

    // Create property and save
    const property = addProperty({
      projectId: currentProject.id,
      propertyType: form.propertyType,
      propertyName: form.propertyName,
      address: form.address,
      propertySizeUnit: form.propertySizeUnit,
      propertySize: form.propertySize,
      doorNo: form.doorNo,
      buildingName: form.buildingName,
      crossRoad: form.crossRoad,
      mainRoad: form.mainRoad,
      landmark: form.landmark,
      areaName: form.areaName,
      state: form.state,
      zone: form.zone,
      district: form.district,
      taluk: form.taluk,
      areaType: form.areaType,
      municipalType: form.municipalType,
      pattanaPanchayathi: form.pattanaPanchayathi,
      urbanWard: form.urbanWard,
      postOffice: form.postOffice,
      pincode: form.pincode,
      latitude: form.latitude,
      longitude: form.longitude,
    });

    // Store current property
    localStorage.setItem("currentProperty", JSON.stringify(property));

    // Navigate to service selection (placeholder)
    navigate("/service-selection");
  };

  // Sample data for dropdowns
  const propertyTypes = ["Apartment", "Villa", "Plot", "Commercial", "Agricultural Land"];
  const propertySizeUnits = ["Square Feet", "Acres", "Hectares", "Guntha"];
  const states = ["Karnataka", "Tamil Nadu", "Kerala", "Andhra Pradesh", "Telangana"];
  const zones = ["Bengaluru Division", "Mysuru Division", "Belagavi Division", "Kalaburagi Division"];
  const districts = ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru"];
  const taluks = ["Dod Ballapur", "Bangalore North", "Bangalore South", "Anekal", "Yelahanka"];
  const municipalTypes = ["CMC", "TMC", "TP", "GBA", "MC"];
  const pattanaPanchayathis = ["Devanahalli(TMC)", "Hoskote", "Nelamangala", "Doddaballapur"];
  const urbanWards = ["URBAN NO.1", "URBAN NO.2", "URBAN NO.3", "URBAN NO.4", "URBAN NO.5"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-lg font-bold text-foreground">
              {currentProject?.title || "Project"}
            </h1>
            <p className="text-sm text-muted-foreground">{projectRefId}</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-6 space-y-6">
          {/* Section Title */}
          <div>
            <h2 className="text-base font-semibold text-foreground text-center">
              Property Details
            </h2>
            <div className="mt-2 h-px bg-border" />
          </div>

          {/* Property Details Fields */}
          <div className="space-y-4">
            {/* Property Type */}
            <div className="space-y-2">
              <Label>Select Property Type</Label>
              <Select
                value={form.propertyType}
                onValueChange={(v) => updateForm("propertyType", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Apartment" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Name */}
            <div className="space-y-2">
              <Label>Property Name</Label>
              <Input
                value={form.propertyName}
                onChange={(e) => updateForm("propertyName", e.target.value)}
                placeholder="Enter property name"
              />
            </div>

            {/* Address (short) */}
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => updateForm("address", e.target.value)}
                placeholder="Enter short address"
              />
            </div>

            {/* Property Size Unit */}
            <div className="space-y-2">
              <Label>Select Property Size</Label>
              <Select
                value={form.propertySizeUnit}
                onValueChange={(v) => updateForm("propertySizeUnit", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Square Feet" />
                </SelectTrigger>
                <SelectContent>
                  {propertySizeUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Size */}
            <div className="space-y-2">
              <Label>Property Size</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={form.propertySize}
                onChange={(e) => updateForm("propertySize", e.target.value)}
                placeholder="Enter size"
              />
            </div>
          </div>

          {/* Address Section */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">Address</h3>
            <div className="space-y-4">
              {/* Door No */}
              <div className="space-y-2">
                <Label>Door No</Label>
                <Input
                  value={form.doorNo}
                  onChange={(e) => updateForm("doorNo", e.target.value)}
                  placeholder="#18"
                />
              </div>

              {/* Building Name */}
              <div className="space-y-2">
                <Label>Building Name</Label>
                <Input
                  value={form.buildingName}
                  onChange={(e) => updateForm("buildingName", e.target.value)}
                  placeholder="Lakshmi Nivasa"
                />
              </div>

              {/* Cross Road */}
              <div className="space-y-2">
                <Label>Cross Road</Label>
                <Input
                  value={form.crossRoad}
                  onChange={(e) => updateForm("crossRoad", e.target.value)}
                  placeholder="2nd Cross"
                />
              </div>

              {/* Main Road */}
              <div className="space-y-2">
                <Label>Main Road</Label>
                <Input
                  value={form.mainRoad}
                  onChange={(e) => updateForm("mainRoad", e.target.value)}
                  placeholder="Bannerghatta Main"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-2">
                <Label>Landmark</Label>
                <Input
                  value={form.landmark}
                  onChange={(e) => updateForm("landmark", e.target.value)}
                  placeholder="Near Meenakshi Temple"
                />
              </div>

              {/* Area Name */}
              <div className="space-y-2">
                <Label>Area Name</Label>
                <Input
                  value={form.areaName}
                  onChange={(e) => updateForm("areaName", e.target.value)}
                  placeholder="Arekere MICO Layout"
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label>State</Label>
                <Select
                  value={form.state}
                  onValueChange={(v) => updateForm("state", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Zone */}
              <div className="space-y-2">
                <Label>Zone</Label>
                <Select
                  value={form.zone}
                  onValueChange={(v) => updateForm("zone", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label>District</Label>
                <Select
                  value={form.district}
                  onValueChange={(v) => updateForm("district", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Taluk */}
              <div className="space-y-2">
                <Label>Taluk</Label>
                <Select
                  value={form.taluk}
                  onValueChange={(v) => updateForm("taluk", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select taluk" />
                  </SelectTrigger>
                  <SelectContent>
                    {taluks.map((taluk) => (
                      <SelectItem key={taluk} value={taluk}>
                        {taluk}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Urban/Rural */}
              <div className="space-y-2">
                <Label>Select Urban / Rural</Label>
                <RadioGroup
                  value={form.areaType}
                  onValueChange={(v) => updateForm("areaType", v as "urban" | "rural")}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urban" id="urban" />
                    <Label htmlFor="urban" className="font-normal cursor-pointer">
                      Urban
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rural" id="rural" />
                    <Label htmlFor="rural" className="font-normal cursor-pointer">
                      Rural
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Municipal Type */}
              <div className="space-y-2">
                <Label>Select CMC/TMC/TP/GBA/MC</Label>
                <Select
                  value={form.municipalType}
                  onValueChange={(v) => updateForm("municipalType", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pattana Panchayathi */}
              <div className="space-y-2">
                <Label>Select Pattana Panchayathi</Label>
                <Select
                  value={form.pattanaPanchayathi}
                  onValueChange={(v) => updateForm("pattanaPanchayathi", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select panchayathi" />
                  </SelectTrigger>
                  <SelectContent>
                    {pattanaPanchayathis.map((pp) => (
                      <SelectItem key={pp} value={pp}>
                        {pp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Urban Ward */}
              <div className="space-y-2">
                <Label>Urban</Label>
                <Select
                  value={form.urbanWard}
                  onValueChange={(v) => updateForm("urbanWard", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {urbanWards.map((ward) => (
                      <SelectItem key={ward} value={ward}>
                        {ward}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Post Office */}
              <div className="space-y-2">
                <Label>Post Office</Label>
                <Input
                  value={form.postOffice}
                  onChange={(e) => updateForm("postOffice", e.target.value)}
                  placeholder="Enter post office"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    updateForm("pincode", value);
                  }}
                  placeholder="Enter pincode"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Address Review */}
          <div className="space-y-2">
            <Label>Address Review</Label>
            <Textarea
              value={formattedAddress}
              readOnly
              className="min-h-[100px] bg-muted text-sm"
              placeholder="Auto-generated address will appear here"
            />
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                value={form.latitude}
                onChange={(e) => updateForm("latitude", e.target.value)}
                placeholder="Enter latitude"
              />
            </div>

            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                value={form.longitude}
                onChange={(e) => updateForm("longitude", e.target.value)}
                placeholder="Enter longitude"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 gap-2"
              onClick={handleSelectLocation}
            >
              <MapPin className="w-4 h-4" />
              Select the location
            </Button>
          </div>

          {/* Bottom padding for footer */}
          <div className="h-20" />
        </div>
      </ScrollArea>

      {/* Location Picker Dialog */}
      <LocationPicker
        open={showLocationPicker}
        onOpenChange={setShowLocationPicker}
        initialLat={form.latitude}
        initialLng={form.longitude}
        onLocationSelect={handleLocationSelect}
      />

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            className="px-8 h-12 rounded-xl font-semibold"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;
