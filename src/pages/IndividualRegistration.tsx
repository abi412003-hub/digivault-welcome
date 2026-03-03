import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Upload, Scan, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWardData } from "@/hooks/useWardData";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ScrollArea } from "@/components/ui/scroll-area";

import { format, differenceInYears } from "date-fns";

interface IndividualProfile {
  prefix: string;
  fullName: string;
  relationPrefix: string;
  relationName: string;
  dateOfBirth: Date | undefined;
  age: number;
  profilePhoto: File | null;
  email: string;
  phone: string;
  whatsappNo: string;
  aadhaarNo: string;
  panNo: string;
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
  wardNo: string;
  postOffice: string;
  pincode: string;
  referralCode: string;
}

const IndividualRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneFromOtp = location.state?.phone || "";

  const [profile, setProfile] = useState<IndividualProfile>(() => {
    // Restore saved form data from localStorage
    try {
      const saved = localStorage.getItem("individualFormDraft");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : undefined,
          profilePhoto: null, // File can't be serialized
          phone: phoneFromOtp || parsed.phone || "",
        };
      }
    } catch (e) {
      console.error("Error restoring form draft:", e);
    }
    return {
      prefix: "",
      fullName: "",
      relationPrefix: "",
      relationName: "",
      dateOfBirth: undefined,
      age: 0,
      profilePhoto: null,
      email: "",
      phone: phoneFromOtp,
      whatsappNo: "",
      aadhaarNo: "",
      panNo: "",
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
      wardNo: "",
      postOffice: "",
      pincode: "",
      referralCode: "",
    };
  });

  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(() => {
    try {
      return localStorage.getItem("individualFormDraftPhoto") || null;
    } catch { return null; }
  });

  // Auto-save form data to localStorage on every change
  useEffect(() => {
    try {
      const toSave = {
        ...profile,
        profilePhoto: null,
        dateOfBirth: profile.dateOfBirth?.toISOString() || null,
      };
      localStorage.setItem("individualFormDraft", JSON.stringify(toSave));
    } catch (e) {
      console.error("Error saving form draft:", e);
    }
  }, [profile]);

  // Save photo preview separately
  useEffect(() => {
    try {
      if (profilePhotoPreview) {
        localStorage.setItem("individualFormDraftPhoto", profilePhotoPreview);
      }
    } catch (e) {
      console.error("Error saving photo preview:", e);
    }
  }, [profilePhotoPreview]);

  // Calculate age from DOB
  useEffect(() => {
    if (profile.dateOfBirth) {
      const age = differenceInYears(new Date(), profile.dateOfBirth);
      setProfile((prev) => ({ ...prev, age }));
    }
  }, [profile.dateOfBirth]);

  // Generate formatted address
  const formattedAddress = useMemo(() => {
    const parts = [
      profile.doorNo,
      profile.buildingName,
      profile.crossRoad,
      profile.mainRoad,
      profile.landmark,
      profile.areaName,
      profile.taluk,
      profile.district,
      profile.state,
      profile.pincode,
    ].filter(Boolean);
    return parts.join(", ");
  }, [
    profile.doorNo,
    profile.buildingName,
    profile.crossRoad,
    profile.mainRoad,
    profile.landmark,
    profile.areaName,
    profile.taluk,
    profile.district,
    profile.state,
    profile.pincode,
  ]);

  const updateProfile = (field: keyof IndividualProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateProfile("profilePhoto", file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const { toast } = useToast();

  const handleNext = async () => {
    if (!profile.fullName.trim()) {
      toast({ title: "Error", description: "Full name is required", variant: "destructive" });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const phone = session.user.phone?.replace("+91", "") || profile.phone;

      // Upload profile photo to Supabase Storage if selected
      let profilePhotoUrl = null;
      if (profile.profilePhoto) {
        const fileExt = profile.profilePhoto.name.split('.').pop();
        const filePath = `${session.user.id}/avatar.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, profile.profilePhoto, { upsert: true });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
          profilePhotoUrl = urlData.publicUrl;
        }
      }

      // Build address JSON
      const address = {
        door_no: profile.doorNo, building_name: profile.buildingName,
        cross_road: profile.crossRoad, main_road: profile.mainRoad,
        landmark: profile.landmark, area_name: profile.areaName,
        state: profile.state, zone: profile.zone,
        district: profile.district, taluk: profile.taluk,
        municipal_type: profile.municipalType,
        pattana_panchayathi: profile.pattanaPanchayathi,
        ward_no: profile.wardNo, post_office: profile.postOffice,
        pincode: profile.pincode,
      };

      await api.post("/v1/auth/register/individual", {
        prefix: profile.prefix || null,
        full_name: profile.fullName,
        phone: phone,
        relation_type: profile.relationPrefix || null,
        relation_name: profile.relationName || null,
        date_of_birth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().split("T")[0] : null,
        age: profile.age || null,
        email: profile.email || null,
        whatsapp_no: profile.whatsappNo || null,
        aadhaar: profile.aadhaarNo || null,
        pan: profile.panNo || null,
        address_type: profile.areaType || null,
        address: address,
        profile_photo_url: profilePhotoUrl,
        referral_code: profile.referralCode || null,
      });

      // Keep localStorage backup
      const profileData = {
        ...profile, profilePhoto: null,
        dateOfBirth: profile.dateOfBirth?.toISOString(),
      };
      localStorage.setItem("individualProfile", JSON.stringify(profileData));

      // Clear form draft after successful save
      localStorage.removeItem("individualFormDraft");
      localStorage.removeItem("individualFormDraftPhoto");

      toast({ title: "Success", description: "Registration saved!" });
      navigate("/projects/create");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({ title: "Error", description: error.message || "Failed to save registration", variant: "destructive" });
    }
  };

  // Sample data for dropdowns
  const states = ["Karnataka"];

  // Cascading ward data
  const wardData = useWardData({
    zone: profile.zone,
    district: profile.district,
    taluk: profile.taluk,
    hobali: profile.municipalType,
    gp: profile.pattanaPanchayathi,
  });

  const updateProfileCascade = (field: keyof IndividualProfile, value: string) => {
    const cascadeFields: Record<string, (keyof IndividualProfile)[]> = {
      zone: ["district", "taluk", "municipalType", "pattanaPanchayathi", "wardNo"],
      district: ["taluk", "municipalType", "pattanaPanchayathi", "wardNo"],
      taluk: ["municipalType", "pattanaPanchayathi", "wardNo"],
      municipalType: ["pattanaPanchayathi", "wardNo"],
      pattanaPanchayathi: ["wardNo"],
    };
    setProfile((prev) => {
      const updated = { ...prev, [field]: value };
      const toClear = cascadeFields[field] || [];
      toClear.forEach((f) => { (updated as any)[f] = ""; });
      return updated;
    });
  };

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
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Welcome to e-DigiVault
            </h1>
            <p className="text-sm text-muted-foreground">
              Secure Access to Documents
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-6 space-y-8">
          {/* Personal Details Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
              Personal Details
            </h2>

            <div className="space-y-4">
              {/* Full Name with Prefix */}
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="flex gap-2">
                  <Select
                    value={profile.prefix}
                    onValueChange={(v) => updateProfile("prefix", v)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Ms">Ms</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={profile.fullName}
                    onChange={(e) => updateProfile("fullName", e.target.value)}
                    placeholder="Enter full name"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Relation Name with Prefix */}
              <div className="space-y-2">
                <Label>Relation Name</Label>
                <div className="flex gap-2">
                  <Select
                    value={profile.relationPrefix}
                    onValueChange={(v) => updateProfile("relationPrefix", v)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Rel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S/O">S/O</SelectItem>
                      <SelectItem value="D/O">D/O</SelectItem>
                      <SelectItem value="W/O">W/O</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={profile.relationName}
                    onChange={(e) => updateProfile("relationName", e.target.value)}
                    placeholder="Enter relation name"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Date of Birth & Age */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={profile.dateOfBirth ? format(profile.dateOfBirth, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const d = new Date(val + "T00:00:00");
                        if (!isNaN(d.getTime()) && d <= new Date()) {
                          updateProfile("dateOfBirth", d);
                        }
                      } else {
                        updateProfile("dateOfBirth", undefined);
                      }
                    }}
                    max={format(new Date(), "yyyy-MM-dd")}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={profile.age || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Profile Photo */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {profile.profilePhoto ? profile.profilePhoto.name : "Upload Photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {profilePhotoPreview && (
                    <img
                      src={profilePhotoPreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone No (Read-only) */}
              <div className="space-y-2">
                <Label>Phone No</Label>
                <Input
                  type="tel"
                  value={profile.phone}
                  disabled
                  className="bg-muted"
                  placeholder="Phone number from OTP"
                />
              </div>

              {/* WhatsApp No */}
              <div className="space-y-2">
                <Label>WhatsApp No</Label>
                <Input
                  type="tel"
                  value={profile.whatsappNo}
                  onChange={(e) => updateProfile("whatsappNo", e.target.value)}
                  placeholder="Enter WhatsApp number"
                />
              </div>

              {/* Aadhaar No */}
              <div className="space-y-2">
                <Label>Aadhaar No</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={profile.aadhaarNo}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 12);
                    updateProfile("aadhaarNo", value);
                  }}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength={12}
                />
              </div>

              {/* PAN No */}
              <div className="space-y-2">
                <Label>PAN No</Label>
                <Input
                  type="text"
                  value={profile.panNo}
                  onChange={(e) =>
                    updateProfile("panNo", e.target.value.toUpperCase().slice(0, 10))
                  }
                  placeholder="Enter PAN number"
                  maxLength={10}
                  className="uppercase"
                />
              </div>
            </div>
          </section>

          {/* Address Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
              Address
            </h2>

            <div className="space-y-4">
              {/* Door No */}
              <div className="space-y-2">
                <Label>Door No</Label>
                <Input
                  value={profile.doorNo}
                  onChange={(e) => updateProfile("doorNo", e.target.value)}
                  placeholder="Enter door number"
                />
              </div>

              {/* Building Name */}
              <div className="space-y-2">
                <Label>Building Name</Label>
                <Input
                  value={profile.buildingName}
                  onChange={(e) => updateProfile("buildingName", e.target.value)}
                  placeholder="Enter building name"
                />
              </div>

              {/* Cross Road */}
              <div className="space-y-2">
                <Label>Cross Road</Label>
                <Input
                  value={profile.crossRoad}
                  onChange={(e) => updateProfile("crossRoad", e.target.value)}
                  placeholder="Enter cross road"
                />
              </div>

              {/* Main Road */}
              <div className="space-y-2">
                <Label>Main Road</Label>
                <Input
                  value={profile.mainRoad}
                  onChange={(e) => updateProfile("mainRoad", e.target.value)}
                  placeholder="Enter main road"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-2">
                <Label>Landmark</Label>
                <Input
                  value={profile.landmark}
                  onChange={(e) => updateProfile("landmark", e.target.value)}
                  placeholder="Enter landmark"
                />
              </div>

              {/* Area Name */}
              <div className="space-y-2">
                <Label>Area Name</Label>
                <Input
                  value={profile.areaName}
                  onChange={(e) => updateProfile("areaName", e.target.value)}
                  placeholder="Enter area name"
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label>State</Label>
                <Select
                  value={profile.state}
                  onValueChange={(v) => updateProfile("state", v)}
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
                  value={profile.zone}
                  onValueChange={(v) => updateProfileCascade("zone", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {wardData.zones.map((zone) => (
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
                  value={profile.district}
                  onValueChange={(v) => updateProfileCascade("district", v)}
                  disabled={!profile.zone}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={profile.zone ? "Select district" : "Select zone first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {wardData.districts.map((district) => (
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
                  value={profile.taluk}
                  onValueChange={(v) => updateProfileCascade("taluk", v)}
                  disabled={!profile.district}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={profile.district ? "Select taluk" : "Select district first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {wardData.taluks.map((taluk) => (
                      <SelectItem key={taluk} value={taluk}>
                        {taluk}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Urban / Rural */}
              <div className="space-y-2">
                <Label>Select Urban / Rural</Label>
                <RadioGroup
                  value={profile.areaType}
                  onValueChange={(v: "urban" | "rural") =>
                    updateProfile("areaType", v)
                  }
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

              {/* Hobali / Municipal Type */}
              <div className="space-y-2">
                <Label>Hobali / CMC / TMC / TP / GBA</Label>
                <Select
                  value={profile.municipalType}
                  onValueChange={(v) => updateProfileCascade("municipalType", v)}
                  disabled={!profile.taluk}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={profile.taluk ? "Select hobali/municipal" : "Select taluk first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {wardData.hobalis.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gram Panchayathi / Local Body */}
              <div className="space-y-2">
                <Label>Gram Panchayathi / Local Body</Label>
                <Select
                  value={profile.pattanaPanchayathi}
                  onValueChange={(v) => updateProfileCascade("pattanaPanchayathi", v)}
                  disabled={!profile.municipalType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={profile.municipalType ? "Select GP / local body" : "Select hobali first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {wardData.gps.map((pp) => (
                      <SelectItem key={pp} value={pp}>
                        {pp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Village / Ward */}
              <div className="space-y-2">
                <Label>Village / Ward</Label>
                <Select
                  value={profile.wardNo}
                  onValueChange={(v) => updateProfile("wardNo", v)}
                  disabled={!profile.pattanaPanchayathi}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={profile.pattanaPanchayathi ? "Select village/ward" : "Select GP first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {wardData.villages.map((ward) => (
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
                  value={profile.postOffice}
                  onChange={(e) => updateProfile("postOffice", e.target.value)}
                  placeholder="Enter post office"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={profile.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    updateProfile("pincode", value);
                  }}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                />
              </div>
            </div>
          </section>

          {/* Address Review */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
              Address Review
            </h2>
            <Textarea
              value={formattedAddress}
              readOnly
              className="min-h-24 bg-muted resize-none"
              placeholder="Your formatted address will appear here..."
            />
          </section>

          {/* BD-Referral Code */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
              BD-Referral Code
            </h2>
            <div className="space-y-2">
              <Label>Type or Scan (Optional)</Label>
              <div className="relative">
                <Input
                  value={profile.referralCode}
                  onChange={(e) =>
                    updateProfile("referralCode", e.target.value.toUpperCase())
                  }
                  placeholder="Enter referral code"
                  className="pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Scan className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Bottom spacing for button */}
          <div className="h-4" />
        </div>
      </ScrollArea>

      {/* Footer Button */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <Button onClick={handleNext} className="w-full h-12 rounded-xl font-semibold">
          Next
        </Button>
      </div>
    </div>
  );
};

export default IndividualRegistration;
