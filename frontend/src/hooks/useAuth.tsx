import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authAPI, debugAPI } from "@/lib/api";

type AppRole = "ADMIN" | "HOD" | "TPO" | "STUDENT";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  department?: string | null;
}

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, department?: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const initializeAuth = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        // Verify token with backend
        const response = await debugAPI.checkToken();
        const userData = response.data.user;

        // Map backend user to Profile format
        const profileData: Profile = {
          id: userData.id,
          name: userData.name || "User",
          email: userData.email,
          role: userData.role,
        };

        setUser(profileData);
        setProfile(profileData);
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Logic: Try admin login first. Backend will check roles.
      // If it's a student, student login might be a separate route or the same.
      // Based on our controllers, they are separate routes.

      let response;
      try {
        // Try admin login (handles ADMIN, TPO, HOD)
        response = await authAPI.adminLogin({ email, password });
      } catch (err: any) {
        // If admin login fails because of "Access denied" (not a authorized account), try student login
        if (err.response?.status === 403 || err.response?.status === 400) {
          response = await authAPI.studentLogin({ email, password });
        } else {
          throw err;
        }
      }

      const { token, admin, user: studentUser } = response.data;
      const userData = admin || studentUser;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      const profileData: Profile = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      setUser(profileData);
      setProfile(profileData);

      return { error: null };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        error: {
          message: error.response?.data?.message || "Invalid credentials"
        }
      };
    }
  };

  const signUp = async (email: string, password: string, name: string, department?: string) => {
    try {
      await authAPI.studentRegister({ email, password, name, department });
      return { error: null };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || "Sign up failed"
        }
      };
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

