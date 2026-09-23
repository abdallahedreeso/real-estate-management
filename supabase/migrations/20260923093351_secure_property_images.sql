-- The images bucket is public for reading. Writes must belong to the Clerk user
-- whose ID is the first path segment (for example user_123/photo.webp).
drop policy if exists "Public 1ffg0oo_0" on storage.objects;
drop policy if exists "Public 1ffg0oo_1" on storage.objects;
drop policy if exists "Public 1ffg0oo_2" on storage.objects;
drop policy if exists "Public 1ffg0oo_3" on storage.objects;
drop policy if exists objects_select_policy on storage.objects;
drop policy if exists objects_insert_policy on storage.objects;
drop policy if exists objects_update_policy on storage.objects;
drop policy if exists objects_delete_policy on storage.objects;

create policy "Anyone can read property images"
on storage.objects for select
using (bucket_id = 'images');

create policy "Owners can upload property images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'images'
  and (storage.foldername(name))[1] = (select public.requesting_user_id())
);

create policy "Owners can delete property images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'images'
  and (storage.foldername(name))[1] = (select public.requesting_user_id())
);
