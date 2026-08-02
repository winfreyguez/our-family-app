import { createClient } from '@supabase/supabase-js'

// Hardcoded keys - this will FORCE the app to work!
const supabaseUrl = 'https://vnxtrumkvuvsuhhvucjm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZueHRydW1rdnV2c3VoaHZ1Y2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MzI1MzgsImV4cCI6MjEwMTIwODUzOH0.MtstxOdT4TAE_hyx5hAhV8dSWDah-ni87KqYvIHLH90'

export const supabase = createClient(supabaseUrl, supabaseKey)
