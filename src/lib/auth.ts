'use client';
import { supabase } from './supabaseClient';

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}