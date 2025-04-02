
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rcpvsbbndteopqfqxaeg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcHZzYmJuZHRlb3BxZnF4YWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NDgwOTAsImV4cCI6MjA1OTEyNDA5MH0.zLS_6SSHKq8pxtezN72DjA6QH8Q5Fo23loBFMW2bj6s'

export const supabase = createClient(supabaseUrl, supabaseKey)
