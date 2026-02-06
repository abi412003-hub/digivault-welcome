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

    const { projectId, propertyId, mainService, subService } = await req.json();

    if (!projectId || !propertyId || !mainService) {
      return new Response(JSON.stringify({ error: "projectId, propertyId, and mainService are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if service request already exists
    const { data: existingRequest } = await supabase
      .from("service_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .eq("property_id", propertyId)
      .eq("main_service", mainService)
      .single();

    if (existingRequest) {
      // Update existing request
      const { data: updated, error: updateError } = await supabase
        .from("service_requests")
        .update({
          sub_service: subService || existingRequest.sub_service,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRequest.id)
        .select()
        .single();

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ serviceRequest: updated, created: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create new service request
    const { data: serviceRequest, error: insertError } = await supabase
      .from("service_requests")
      .insert({
        user_id: user.id,
        project_id: projectId,
        property_id: propertyId,
        main_service: mainService,
        sub_service: subService || null,
        status: "draft",
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ serviceRequest, created: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
