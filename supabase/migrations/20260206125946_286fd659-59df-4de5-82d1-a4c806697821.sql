-- Extend existing profiles table to match users requirements
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS registration_type TEXT;

-- Add prNumber to existing projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS pr_number TEXT;

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL,
  property_name TEXT NOT NULL,
  address_short TEXT,
  size_unit TEXT,
  size_value NUMERIC,
  address_fields JSONB,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for properties
CREATE POLICY "Users can view their own properties"
ON public.properties FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties"
ON public.properties FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
ON public.properties FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
ON public.properties FOR DELETE
USING (auth.uid() = user_id);

-- Create service_requests table
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  main_service TEXT NOT NULL,
  sub_service TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on service_requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service_requests
CREATE POLICY "Users can view their own service requests"
ON public.service_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service requests"
ON public.service_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service requests"
ON public.service_requests FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service requests"
ON public.service_requests FOR DELETE
USING (auth.uid() = user_id);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  doc_group TEXT NOT NULL,
  doc_name TEXT NOT NULL,
  file_url TEXT,
  not_available BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents"
ON public.documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
ON public.documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON public.documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON public.documents FOR DELETE
USING (auth.uid() = user_id);

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'Pending',
  related_type TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activities
CREATE POLICY "Users can view their own activities"
ON public.activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
ON public.activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
ON public.activities FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
ON public.activities FOR DELETE
USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item TEXT NOT NULL,
  project_name TEXT,
  property_name TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for documents bucket
CREATE POLICY "Users can view their own documents in storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents in storage"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents from storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to generate PR number
CREATE OR REPLACE FUNCTION public.generate_pr_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  SELECT 'PR-' || LPAD((COALESCE(MAX(NULLIF(SUBSTRING(pr_number FROM 4), '')::INTEGER), 0) + 1)::TEXT, 6, '0')
  INTO new_number
  FROM public.projects
  WHERE pr_number IS NOT NULL AND pr_number ~ '^PR-[0-9]+$';
  
  IF new_number IS NULL THEN
    new_number := 'PR-000001';
  END IF;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-update updated_at on service_requests
CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();