-- Set default value for owner_id to automatically use the authenticated user's ID
ALTER TABLE public.projects 
ALTER COLUMN owner_id SET DEFAULT auth.uid();