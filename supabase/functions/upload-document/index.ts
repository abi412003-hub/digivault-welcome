import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const serviceRequestId = formData.get("serviceRequestId") as string;
    const docGroup = formData.get("docGroup") as string;
    const docName = formData.get("docName") as string;

    if (!file || !serviceRequestId || !docGroup || !docName) {
      return new Response(JSON.stringify({ error: "file, serviceRequestId, docGroup, and docName are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify service request belongs to user
    const { data: serviceRequest, error: srError } = await supabase
      .from("service_requests")
      .select("id")
      .eq("id", serviceRequestId)
      .eq("user_id", user.id)
      .single();

    if (srError || !serviceRequest) {
      return new Response(JSON.stringify({ error: "Service request not found or access denied" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upload file to storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${serviceRequestId}/${docName.replace(/\s+/g, "_")}_${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName);

    const fileUrl = urlData.publicUrl;

    // Check if document already exists
    const { data: existingDoc } = await supabase
      .from("documents")
      .select("id")
      .eq("service_request_id", serviceRequestId)
      .eq("doc_name", docName)
      .eq("user_id", user.id)
      .single();

    if (existingDoc) {
      // Update existing document
      const { data: updated, error: updateError } = await supabase
        .from("documents")
        .update({
          file_url: fileUrl,
          not_available: false,
          status: "uploaded",
        })
        .eq("id", existingDoc.id)
        .select()
        .single();

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ document: updated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create new document record
    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        service_request_id: serviceRequestId,
        doc_group: docGroup,
        doc_name: docName,
        file_url: fileUrl,
        not_available: false,
        status: "uploaded",
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ document }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
