import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DatabaseService } from '@/lib/DatabaseService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await DatabaseService.getProfile(session.user.id);
                setUser({ ...session.user, role: profile?.role || null });
            }
            setLoading(false);
        };
        
        checkSession();

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: profile } = await DatabaseService.getProfile(session.user.id);
                setUser({ ...session.user, role: profile?.role || null });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            if (listener?.subscription) {
                listener.subscription.unsubscribe();
            }
        };
    }, []);

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { data, error };
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (data?.user) {
            const { data: profile } = await DatabaseService.getProfile(data.user.id);
            setUser({ ...data.user, role: profile?.role || null });
        }
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            setUser(null);
        }
        return { error };
    };

    const updateProfile = async (updates) => {
        const { data, error } = await DatabaseService.updateProfile(user.id, updates);
        if (data) {
            setUser((prev) => ({ ...prev, ...data }));
        }
        return { data, error };
    };

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};