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

    const { serviceRequestId } = await req.json();

    if (!serviceRequestId) {
      return new Response(JSON.stringify({ error: "serviceRequestId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify service request belongs to user
    const { data: serviceRequest, error: srError } = await supabase
      .from("service_requests")
      .select("*, properties(property_name), projects(title)")
      .eq("id", serviceRequestId)
      .eq("user_id", user.id)
      .single();

    if (srError || !serviceRequest) {
      return new Response(JSON.stringify({ error: "Service request not found or access denied" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to draft
    const { data: updated, error: updateError } = await supabase
      .from("service_requests")
      .update({
        status: "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", serviceRequestId)
      .select()
      .single();

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create or update activity
    const activityTitle = `${serviceRequest.main_service} - ${serviceRequest.properties?.property_name || "Property"}`;
    
    const { data: existingActivity } = await supabase
      .from("activities")
      .select("id")
      .eq("user_id", user.id)
      .eq("related_type", "service_request")
      .eq("related_id", serviceRequestId)
      .single();

    if (existingActivity) {
      await supabase
        .from("activities")
        .update({
          title: activityTitle,
          status: "Pending",
          date: new Date().toISOString(),
        })
        .eq("id", existingActivity.id);
    } else {
      await supabase
        .from("activities")
        .insert({
          user_id: user.id,
          title: activityTitle,
          status: "Pending",
          related_type: "service_request",
          related_id: serviceRequestId,
        });
    }

    return new Response(JSON.stringify({ serviceRequest: updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
