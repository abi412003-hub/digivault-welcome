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

    const { serviceRequestId, docName, notAvailable } = await req.json();

    if (!serviceRequestId || !docName || typeof notAvailable !== "boolean") {
      return new Response(JSON.stringify({ error: "serviceRequestId, docName, and notAvailable are required" }), {
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

    // Check if document exists
    const { data: existingDoc } = await supabase
      .from("documents")
      .select("id, file_url")
      .eq("service_request_id", serviceRequestId)
      .eq("doc_name", docName)
      .eq("user_id", user.id)
      .single();

    if (existingDoc) {
      // If setting notAvailable to true, clear the file_url
      const updateData: Record<string, unknown> = {
        not_available: notAvailable,
      };
      
      if (notAvailable) {
        updateData.file_url = null;
        updateData.status = "not_available";
      }

      const { data: updated, error: updateError } = await supabase
        .from("documents")
        .update(updateData)
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

    // Create new document record with notAvailable flag
    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        service_request_id: serviceRequestId,
        doc_group: "common", // default group
        doc_name: docName,
        file_url: null,
        not_available: notAvailable,
        status: notAvailable ? "not_available" : "pending",
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
