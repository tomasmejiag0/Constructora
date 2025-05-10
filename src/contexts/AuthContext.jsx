import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  loginWithProfile, 
  logoutProfile, 
  getProfileSession,
  createProfileUser,
  checkUserExistsByEmail,
  fetchAllUsersAdminService
} from '@/services/authService';
import { 
  fetchAllProjects, 
  createProject as createProjectService, 
  fetchAllTasks, 
  createTask as createTaskService, 
  fetchAllProjectAssignments, 
  assignWorker as assignWorkerService 
} from '@/services/dataService';

const AuthContext = createContext(null);

const AuthProviderInternal = ({ children }) => {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projectAssignments, setProjectAssignments] = useState([]);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleError = useCallback((error, title, customDescription) => {
    console.error(`${title}:`, error.message, error.details || error.stack || error);
    const description = customDescription || error.message || "An unexpected error occurred.";
    toast({ variant: "destructive", title: title, description: description });
    if (error.message === "TypeError: Failed to fetch" || (error.message && error.message.includes("Network error"))) {
      toast({ variant: "destructive", title: "Network Error", description: "Could not connect to the server. Please check your internet connection and Supabase CORS settings."});
    }
  }, [toast]);
  
  const loadInitialData = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setTasks([]);
      setProjectAssignments([]);
      setAllUsers([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const dataPromises = [
        fetchAllProjects(),
        fetchAllTasks(),
        fetchAllProjectAssignments(),
      ];
      if (user.role === 'admin') {
        dataPromises.push(fetchAllUsersAdminService());
      }

      const [fetchedProjects, fetchedTasks, fetchedAssignments, fetchedUsers] = await Promise.all(dataPromises);
      
      setProjects(fetchedProjects || []);
      setTasks(fetchedTasks || []);
      setProjectAssignments(fetchedAssignments || []);
      if (user.role === 'admin') {
        setAllUsers(fetchedUsers || []);
      } else {
        setAllUsers([]);
      }

    } catch (error) {
      handleError(error, "Error loading initial data");
    } finally {
      setLoading(false);
    }
  }, [user, handleError]);

  useEffect(() => {
    let isMounted = true;
    const initializeSession = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        const sessionUser = getProfileSession();
        if (sessionUser) {
          setUser(sessionUser);
        } else {
          setUser(null);
          // If no session, navigate to login, unless already there
          if (window.location.pathname !== '/login') {
            navigate('/login');
          }
        }
      } catch (error) {
        if (isMounted) handleError(error, "Error initializing session from storage");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeSession();

    return () => { isMounted = false; };
  }, [handleError, navigate]); 
  
  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      setProjects([]);
      setTasks([]);
      setProjectAssignments([]);
      setAllUsers([]);
      // Si quieres redirigir, puedes dejar la navegación aquí, pero sin depender de loading
      // if (window.location.pathname !== '/login') { 
      //   navigate('/login'); 
      // }
    }
  }, [user, loadInitialData, navigate]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedInUser = await loginWithProfile(email, password);
      setUser(loggedInUser);
      toast({ title: "Login Successful", description: `Welcome back, ${loggedInUser.name}!` });
      navigate(`/${loggedInUser.role}/dashboard`);
      return true;
    } catch (error) {
      handleError(error, "Login Failed");
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    logoutProfile();
    setUser(null);
    setAllUsers([]);
    setProjects([]);
    setTasks([]);
    setProjectAssignments([]);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    navigate('/login');
    setLoading(false);
  };
  
  const addUser = async (newUserData) => {
    if (!user || user.role !== 'admin') {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only admins can create users." });
      return false;
    }
    setLoading(true);
    try {
      await createProfileUser(newUserData);
      toast({title: "User Created", description: `User ${newUserData.name} has been successfully created.`});
      setAllUsers(await fetchAllUsersAdminService());
      return true;
    } catch (error) {
       if (error.message.includes("User with this email already exists")) {
         toast({ variant: "destructive", title: "User Creation Failed", description: "This email is already registered." });
       } else {
        handleError(error, "User Creation Failed");
       }
       return false;
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData) => {
    setLoading(true);
    try {
      const newProjects = await createProjectService(projectData);
      toast({title: "Project Created", description: `${projectData.name} has been successfully created.`});
      setProjects(prev => [...prev, ...(newProjects || [])]);
    } catch (error) {
      handleError(error, "Project Creation Failed");
    } finally {
      setLoading(false);
    }
  };
  
  const addTask = async (taskData) => {
    if (!user) {
      handleError(new Error("User not authenticated"), "Task Creation Failed", "You must be logged in to create tasks.");
      return;
    }
    setLoading(true);
    try {
      const newTasks = await createTaskService({...taskData, created_by_user_id: user.id });
      toast({title: "Task Created", description: `Task "${taskData.title}" has been successfully created.`});
      setTasks(prev => [...prev, ...(newTasks || [])]);
    } catch (error) {
      handleError(error, "Task Creation Failed");
    } finally {
      setLoading(false);
    }
  };

  const assignWorkerToProject = async (userId, projectId) => {
    setLoading(true);
    try {
      await assignWorkerService(userId, projectId);
      toast({title: "Worker Assignment Updated", description: `Worker assignment has been updated for project.`});
      setProjectAssignments(await fetchAllProjectAssignments());
    } catch (error) {
      handleError(error, "Worker Assignment Failed");
    } finally {
      setLoading(false);
    }
  };
  
  const getProjectById = (projectId) => projects.find(p => p.id === projectId);

  const refreshAllUsers = useCallback(async () => {
    if (user && user.role === 'admin') {
      setLoading(true);
      try {
        setAllUsers(await fetchAllUsersAdminService());
      } catch (error) {
        handleError(error, "Error refreshing user list");
      } finally {
        setLoading(false);
      }
    }
  }, [user, handleError]);

  const value = {
    user, allUsers, loading, projects, tasks, projectAssignments,
    login, logout, addUser, addProject, addTask, assignWorkerToProject,
    getProjectById,
    fetchProjects: useCallback(async () => {
      setLoading(true);
      try { setProjects(await fetchAllProjects()); }
      catch (e) { handleError(e, "Error fetching projects"); }
      finally { setLoading(false); }
    }, [handleError]),
    fetchTasks: useCallback(async () => {
      setLoading(true);
      try { setTasks(await fetchAllTasks()); }
      catch (e) { handleError(e, "Error fetching tasks"); }
      finally { setLoading(false); }
    }, [handleError]),
    fetchProjectAssignments: useCallback(async () => {
      setLoading(true);
      try { setProjectAssignments(await fetchAllProjectAssignments()); }
      catch (e) { handleError(e, "Error fetching assignments"); }
      finally { setLoading(false); }
    }, [handleError]),
    fetchAllUsers: refreshAllUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider = ({ children }) => {
  return <AuthProviderInternal>{children}</AuthProviderInternal>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
