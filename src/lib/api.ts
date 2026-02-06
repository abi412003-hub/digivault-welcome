import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

async function callFunction<T>(
  functionName: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    body?: Record<string, unknown>;
    queryParams?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = "POST", body, queryParams } = options;
  const headers = await getAuthHeaders();

  let url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  if (queryParams) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// User Profile
export async function ensureUserProfile() {
  return callFunction<{ profile: unknown; created: boolean }>("ensure-user-profile");
}

// Projects
export async function createProject(title: string, description?: string) {
  return callFunction<{ project: unknown }>("create-project", {
    body: { title, description },
  });
}

export async function listProjects() {
  return callFunction<{ projects: unknown[] }>("list-projects", { method: "GET" });
}

// Properties
export async function createProperty(
  projectId: string,
  propertyData: {
    propertyType: string;
    propertyName: string;
    addressShort?: string;
    sizeUnit?: string;
    sizeValue?: number;
    addressFields?: Record<string, unknown>;
    latitude?: number;
    longitude?: number;
  }
) {
  return callFunction<{ property: unknown }>("create-property", {
    body: { projectId, propertyData },
  });
}

export async function listProperties(projectId: string) {
  return callFunction<{ properties: unknown[] }>("list-properties", {
    method: "GET",
    queryParams: { projectId },
  });
}

// Service Requests
export async function createOrUpdateServiceRequest(
  projectId: string,
  propertyId: string,
  mainService: string,
  subService?: string
) {
  return callFunction<{ serviceRequest: unknown; created: boolean }>("service-request", {
    body: { projectId, propertyId, mainService, subService },
  });
}

// Documents
export async function uploadDocument(
  serviceRequestId: string,
  docGroup: string,
  docName: string,
  file: File
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("serviceRequestId", serviceRequestId);
  formData.append("docGroup", docGroup);
  formData.append("docName", docName);

  const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-document`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return data as { document: unknown };
}

export async function toggleNotAvailable(
  serviceRequestId: string,
  docName: string,
  notAvailable: boolean
) {
  return callFunction<{ document: unknown }>("toggle-not-available", {
    body: { serviceRequestId, docName, notAvailable },
  });
}

export async function deleteDocument(documentId: string) {
  return callFunction<{ success: boolean }>("delete-document", {
    body: { documentId },
  });
}

// Service Request Status
export async function saveDraft(serviceRequestId: string) {
  return callFunction<{ serviceRequest: unknown }>("save-draft", {
    body: { serviceRequestId },
  });
}

export async function submitServiceRequest(
  serviceRequestId: string,
  requiredDocNames?: string[],
  skipValidation = false
) {
  return callFunction<{ serviceRequest: unknown; success: boolean }>(
    "submit-service-request",
    {
      body: { serviceRequestId, requiredDocNames, skipValidation },
    }
  );
}

// Activities
export async function listActivities() {
  return callFunction<{ activities: unknown[] }>("list-activities", { method: "GET" });
}

// Transactions
export async function listTransactions() {
  return callFunction<{ transactions: unknown[] }>("list-transactions", { method: "GET" });
}
