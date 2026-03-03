import { useState, useEffect, useMemo } from "react";

// Hierarchy: Zone → District → Taluk → Hobali → GP → Village/Ward
type WardData = Record<string, Record<string, Record<string, Record<string, Record<string, string[]>>>>>;

let cachedData: WardData | null = null;
let loadPromise: Promise<WardData> | null = null;

async function loadWardData(): Promise<WardData> {
  if (cachedData) return cachedData;
  if (loadPromise) return loadPromise;

  loadPromise = fetch("/ward-data.json")
    .then((res) => res.json())
    .then((data: WardData) => {
      cachedData = data;
      return data;
    });

  return loadPromise;
}

interface UseWardDataOptions {
  zone: string;
  district: string;
  taluk: string;
  hobali: string;
  gp: string;
}

export function useWardData(selections: UseWardDataOptions) {
  const [data, setData] = useState<WardData | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }
    loadWardData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const zones = useMemo(() => {
    if (!data) return [];
    return Object.keys(data).sort();
  }, [data]);

  const districts = useMemo(() => {
    if (!data || !selections.zone || !data[selections.zone]) return [];
    return Object.keys(data[selections.zone]).sort();
  }, [data, selections.zone]);

  const taluks = useMemo(() => {
    if (!data || !selections.zone || !selections.district) return [];
    const zoneData = data[selections.zone];
    if (!zoneData || !zoneData[selections.district]) return [];
    return Object.keys(zoneData[selections.district]).sort();
  }, [data, selections.zone, selections.district]);

  const hobalis = useMemo(() => {
    if (!data || !selections.zone || !selections.district || !selections.taluk) return [];
    const talukData = data[selections.zone]?.[selections.district]?.[selections.taluk];
    if (!talukData) return [];
    return Object.keys(talukData).sort();
  }, [data, selections.zone, selections.district, selections.taluk]);

  const gps = useMemo(() => {
    if (!data || !selections.zone || !selections.district || !selections.taluk || !selections.hobali)
      return [];
    const hobaliData =
      data[selections.zone]?.[selections.district]?.[selections.taluk]?.[selections.hobali];
    if (!hobaliData) return [];
    return Object.keys(hobaliData).sort();
  }, [data, selections.zone, selections.district, selections.taluk, selections.hobali]);

  const villages = useMemo(() => {
    if (
      !data ||
      !selections.zone ||
      !selections.district ||
      !selections.taluk ||
      !selections.hobali ||
      !selections.gp
    )
      return [];
    const gpData =
      data[selections.zone]?.[selections.district]?.[selections.taluk]?.[selections.hobali]?.[
        selections.gp
      ];
    if (!gpData) return [];
    return [...gpData].sort();
  }, [data, selections.zone, selections.district, selections.taluk, selections.hobali, selections.gp]);

  return { loading, zones, districts, taluks, hobalis, gps, villages };
}
