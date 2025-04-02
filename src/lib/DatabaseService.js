import { supabase } from './supabase'

export const DatabaseService = {
    // Profiles
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        return { data, error }
    },

    async createProfile(profileData) {
        const allowedRoles = ['Supervisor', 'Trabajador', 'Administrador'];
        if (!allowedRoles.includes(profileData.role)) {
            return { error: 'Rol inválido. Debe ser Supervisor, Trabajador o Administrador.' };
        }
    
        const { data, error } = await supabase
            .from('profiles')
            .insert([{
                id: profileData.id,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                role: profileData.role,
                phone: profileData.phone,
                email: profileData.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);
        return { data, error };
    },
    

    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
        return { data, error }
    },

    // Attendance
    async checkIn(userId) {
        const { data, error } = await supabase
            .from('attendance')
            .insert([{
                user_id: userId,
                check_in: new Date().toISOString(),
                status: 'present'
            }])
        return { data, error }
    },

    async checkOut(userId) {
        const { data, error } = await supabase
            .from('attendance')
            .update({ check_out: new Date().toISOString() })
            .eq('user_id', userId)
            .is('check_out', null)
        return { data, error }
    },

    // Tasks
    async createTask(taskData) {
        const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
        return { data, error }
    },

    async getTasks() {
        const { data, error } = await supabase
            .from('tasks')
            .select('*, user_tasks(*)')
        return { data, error }
    },

    async updateTask(taskId, updates) {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
        return { data, error }
    },

    // Inventory
    async getInventory() {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
        return { data, error }
    },

    async updateInventory(id, updates) {
        const { data, error } = await supabase
            .from('inventory')
            .update(updates)
            .eq('id', id)
        return { data, error }
    },

    async createInventoryTransaction(transactionData) {
        const { data, error } = await supabase
            .from('inventory_transactions')
            .insert([transactionData])
        return { data, error }
    },

    // Budget
    async addBudgetEntry(entry) {
        const { data, error } = await supabase
            .from('budget')
            .insert([entry])
        return { data, error }
    },

    async getBudgetSummary() {
        const { data, error } = await supabase
            .from('budget')
            .select('*')
        return { data, error }
    },

    // Test Connection
    async testConnection() {
        try {
            const { data, error } = await supabase.from('profiles').select('count').limit(1)
            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Connection error:', error.message)
            return { success: false, error: error.message }
        }
    }
}
