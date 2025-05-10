import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const handleSupabaseError = (error, context) => {
  console.error(`Supabase error in ${context}:`, error.message, error.details || error.stack || error);
  if (error.message === "TypeError: Failed to fetch") {
    throw new Error("Network error: Could not connect to Supabase. Please check your internet connection and CORS settings.");
  }
  throw error;
};

export const loginWithProfile = async (email, password) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('User not found.');
      }
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, data.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password.');
    }

    const userSession = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      status: data.status,
    };

    // Store session data in cookies
    const sessionId = uuidv4();
    document.cookie = `sessionId=${sessionId}; path=/; secure; samesite=strict; max-age=86400`;
    document.cookie = `userData=${JSON.stringify(userSession)}; path=/; secure; samesite=strict; max-age=86400`;

    return userSession;
  } catch (error) {
    handleSupabaseError(error, 'loginWithProfile');
  }
};

export const logoutProfile = () => {
  document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const getProfileSession = () => {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  if (!cookies.userData) return null;

  try {
    return JSON.parse(decodeURIComponent(cookies.userData));
  } catch (error) {
    console.error('Error parsing user data from cookie:', error);
    return null;
  }
};

export const createProfileUser = async (userData) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const profileData = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email,
      password_hash: passwordHash,
      role: userData.role,
      status: 'Active',
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;
    
    const { password_hash, ...userWithoutPassword } = data;
    return userWithoutPassword;
  } catch (error) {
    handleSupabaseError(error, 'createProfileUser');
  }
};

export const checkUserExistsByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  } catch (error) {
    handleSupabaseError(error, 'checkUserExistsByEmail');
  }
};

export const fetchUserProfileById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, status')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'fetchUserProfileById');
  }
};

export const fetchAllUsersAdminService = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, status');
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'fetchAllUsersAdminService');
  }
};

export const upsertProfileService = async (profileData) => {
  try {
    const { id, password, ...updateData } = profileData;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      updateData.password_hash = passwordHash;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, role, status')
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'upsertProfileService');
  }
};