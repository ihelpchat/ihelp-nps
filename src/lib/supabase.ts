import { createClient } from '@supabase/supabase-js';

// Configuração direta do Supabase com as credenciais fornecidas
const supabaseUrl = 'https://cxbvqfhdblmlvrgzuqpd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4YnZxZmhkYmxtbHZyZ3p1cXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMTY2MjAsImV4cCI6MjA1Nzc5MjYyMH0.7Jrl8_qtkjExzC98QWn1Fl2fVcXNL_E0y-_NTxhSLrc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);