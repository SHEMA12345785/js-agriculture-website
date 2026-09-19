create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.gallery_items enable row level security;

create policy "Public can view gallery items"
on public.gallery_items for select
using (true);

create policy "Authenticated users can insert gallery items"
on public.gallery_items for insert
with check (auth.uid() is not null);

create policy "Authenticated users can update gallery items"
on public.gallery_items for update
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Authenticated users can delete gallery items"
on public.gallery_items for delete
using (auth.uid() is not null);

create trigger if not exists handle_gallery_updated_at
before update on public.gallery_items
for each row
execute procedure moddatetime(updated_at);

create policy "Public gallery images are viewable"
on storage.objects for select
using (bucket_id = 'gallery');

create policy "Authenticated users can upload gallery images"
on storage.objects for insert
with check (bucket_id = 'gallery' and auth.role() = 'authenticated');

create policy "Authenticated users can update gallery images"
on storage.objects for update
using (bucket_id = 'gallery' and auth.role() = 'authenticated')
with check (bucket_id = 'gallery' and auth.role() = 'authenticated');

create policy "Authenticated users can delete gallery images"
on storage.objects for delete
using (bucket_id = 'gallery' and auth.role() = 'authenticated');
