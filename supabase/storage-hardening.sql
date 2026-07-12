-- DomiVault Storage hardening
-- Run this in the Supabase SQL Editor to restrict document uploads to supported MIME types.

drop policy if exists "Plus users can upload own receipt files" on storage.objects;

create policy "Plus users can upload own receipt files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
  and lower(coalesce(metadata->>'mimetype', '')) in (
    'application/json',
    'application/pdf',
    'application/xml',
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/png',
    'image/tiff',
    'image/webp',
    'text/csv',
    'text/markdown',
    'text/plain',
    'text/xml'
  )
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.plan_tier = 'vault_plus'
  )
);
