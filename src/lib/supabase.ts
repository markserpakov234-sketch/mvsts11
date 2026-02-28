import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yswkrrcptkzknhnktdrf.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzd2tycmNwdGt6a25obmt0ZHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODU4NTUsImV4cCI6MjA4NzM2MTg1NX0.5Imeonx9RW6xDiXdF1Bog4vBu-NQ_Yjp7gj_GCFQEiM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
