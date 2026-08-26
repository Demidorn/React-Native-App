# React-Native-App
Full stack Real estate app
 ## Building a real estate application.

 ## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start -c
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Supabase Queries

### User Table

```sql
create table users (
  id uuid default gen_random_uuid() primary key,
  clerk_id text unique not null,
  email text not null,
  first_name text,
  last_name text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamp with time zone default now()
);
```

### User RLS Policies

```sql
-- Enable RLS on users table
alter table users enable row level security;

create policy "Users can insert own row"
on users for insert
with check (clerk_id = auth.jwt()->>'sub');

create policy "Users can read own row"
on users for select
using (clerk_id = auth.jwt()->>'sub');

create policy "Users can update own row"
on users for update
using (clerk_id = auth.jwt()->>'sub');
```

### Properties Table

```sql
create table properties (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price numeric not null,
  type text not null, -- 'apartment' | 'house' | 'villa' | 'studio'
  bedrooms int not null default 1,
  bathrooms int not null default 1,
  area_sqft int,
  address text not null,
  city text not null,
  latitude float,
  longitude float,
  images text[] default '{}', -- array of Supabase Storage URLs
  is_featured boolean default false,
  is_sold boolean default false,
  created_at timestamp with time zone default now()
);

alter table properties enable row level security;

-- Anyone can read properties (public listings)
create policy "Properties are publicly readable"
on properties for select
using (true);
```

### Saved Property Table

```sql
create table saved_properties (
  id uuid default gen_random_uuid() primary key,
  user_clerk_id text not null references users(clerk_id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_clerk_id, property_id) -- prevents duplicate saves
);

alter table saved_properties enable row level security;

create policy "Users can read own saved properties"
on saved_properties for select
using (user_clerk_id = auth.jwt()->>'sub');

create policy "Users can insert saved properties"
on saved_properties for insert
with check (user_clerk_id = auth.jwt()->>'sub');

create policy "Users can delete own saved properties"
on saved_properties for delete
using (user_clerk_id = auth.jwt()->>'sub');

```

### Insert Public Property Image Bucket

```sql
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true);

-- Allow anyone to read images (they're public listings)
create policy "Public can read property images"
on storage.objects for select
using (bucket_id = 'property-images');
```

### Admin Flag and Properties RLS Policies

```sql
alter table users 
add column is_admin boolean default false;

create policy "Admin can insert properties"
on properties for insert
with check (
  exists (
    select 1 from users
    where clerk_id = auth.jwt()->>'sub'
    and is_admin = true
  )
);

create policy "Admin can update properties"
on properties for update
using (
  exists (
    select 1 from users
    where clerk_id = auth.jwt()->>'sub'
    and is_admin = true
  )
);

create policy "Admin can delete properties"
on properties for delete
using (
  exists (
    select 1 from users
    where clerk_id = auth.jwt()->>'sub'
    and is_admin = true
  )
);

create policy "Admin can upload property images"
on storage.objects for insert
with check (
  bucket_id = 'property-images'
  and exists (
    select 1 from users
    where clerk_id = auth.jwt()->>'sub'
    and is_admin = true
  )
);
```

### Seeding Properties
