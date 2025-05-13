import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { ProfileType, User } from '../../../backend/src/types'; // Importar tipos do backend

// Definir a URL base da API
const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : '/api'; // Ajustar para produção se necessário

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, expectedProfileType: ProfileType) => Promise<void>;
  register: (email: string, password: string, profileType: ProfileType, userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Começa como true para verificar token inicial
  const [error, setError] = useState<string | null>(null);

  // Função para decodificar token (exemplo básico)
  const decodeToken = (token: string): User | null => {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decodedPayload = JSON.parse(decodedJson);
      // Aqui você pode adicionar validação de expiração (decodedPayload.exp)
      return {
        id: decodedPayload.id,
        email: decodedPayload.email,
        profile_type: decodedPayload.profileType,
        created_at: new Date() // Pode buscar dados reais do perfil se necessário
      };
    } catch (e) {
      console.error("Erro ao decodificar token:", e);
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      const decodedUser = decodeToken(storedToken);
      if (decodedUser) {
        setToken(storedToken);
        setUser(decodedUser);
        // Configurar axios para enviar o token em futuras requisições
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        // Token inválido/expirado, limpar
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, expectedProfileType: ProfileType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password, expectedProfileType });
      const { token: newToken, user: loggedInUser } = response.data;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(loggedInUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
      console.error("Erro de login:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, profileType: ProfileType, userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { email, password, profileType, userData });
      const { token: newToken, user: registeredUser } = response.data;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(registeredUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao registrar');
      console.error("Erro de registro:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    // Redirecionar para a página inicial ou de login, se necessário
    // window.location.href = '/'; 
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
