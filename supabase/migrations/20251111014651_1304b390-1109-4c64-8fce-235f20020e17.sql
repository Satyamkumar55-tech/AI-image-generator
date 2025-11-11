-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true);

-- Create storage policies for generated images
CREATE POLICY "Users can view their own generated images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own generated images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own generated images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update images table to use storage path instead of base64 data
ALTER TABLE images ALTER COLUMN image_data TYPE text;
COMMENT ON COLUMN images.image_data IS 'Storage path or URL to the generated image';