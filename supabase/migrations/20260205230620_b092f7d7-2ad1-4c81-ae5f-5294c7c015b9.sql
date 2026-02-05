-- Create ensure_profile function that creates/updates profile with safe defaults
CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_phone text;
BEGIN
  -- Get current user's id and phone from auth
  v_user_id := auth.uid();
  v_phone := auth.jwt() ->> 'phone';
  
  -- Insert profile if not exists, otherwise update only null fields
  INSERT INTO public.profiles (id, phone, role, user_type)
  VALUES (v_user_id, v_phone, 'client', 'individual')
  ON CONFLICT (id) DO UPDATE SET
    phone = COALESCE(profiles.phone, EXCLUDED.phone),
    role = COALESCE(profiles.role, EXCLUDED.role),
    user_type = COALESCE(profiles.user_type, EXCLUDED.user_type),
    updated_at = now();
END;
$$;