import { supabase } from './supabase'

export async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1)
        
        if (error) {
            console.error('Connection error:', error.message)
            return { success: false, error: error.message }
        }
        
        console.log('Successfully connected to Supabase!')
        return { success: true, data }
        
    } catch (error) {
        console.error('Connection error:', error.message)
        return { success: false, error: error.message }
    }
}
