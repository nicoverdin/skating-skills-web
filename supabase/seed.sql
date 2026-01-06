-- WARNING: TEST DATA ONLY. DO NOT USE IN PRODUCTION.
-- This file contains hardcoded credentials for local development.

-- 1. Create a test user in auth.users (Supabase internal)
-- Password is 'password'
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
  'authenticated', 
  'authenticated', 
  'admin@clubpatinaje.com', 
  crypt('password', gen_salt('bf')), 
  current_timestamp, 
  current_timestamp, 
  current_timestamp, 
  '{"provider":"email","providers":["email"]}', 
  '{}', 
  current_timestamp, 
  current_timestamp, 
  '', 
  '', 
  '', 
  ''
);

-- 2. Create the profile linked to that user with ADMIN role
INSERT INTO public.profiles (id, first_name, last_name, role)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
  'Super', 
  'Admin', 
  'admin'
);
