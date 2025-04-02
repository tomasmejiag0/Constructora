import { useEffect, useState } from 'react'
import { DatabaseService } from '../lib/DatabaseService'

export function TestConnection() {
    const [connectionStatus, setConnectionStatus] = useState('Testing...')
    const [user, setUser] = useState(null)

    useEffect(() => {
        async function testConnection() {
            const result = await DatabaseService.testConnection()
            setConnectionStatus(result.success ? 'Connected!' : `Error: ${result.error}`)
        }

        async function getCurrentUser() {
            const { user, error } = await DatabaseService.getCurrentUser()
            if (user) setUser(user)
            if (error) console.error('Error getting user:', error.message)
        }

        testConnection()
        getCurrentUser()
    }, [])

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
            <p className="mb-2">Connection Status: {connectionStatus}</p>
            {user && (
                <div className="mb-4">
                    <p>Logged in as: {user.email}</p>
                </div>
            )}
        </div>
    )
}
