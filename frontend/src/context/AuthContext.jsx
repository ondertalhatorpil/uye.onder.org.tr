import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services';

// Auth Context oluştur
const AuthContext = createContext();

// Auth state için initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Auth reducer - state yönetimi
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sayfa yüklendiğinde token kontrolü yap
  useEffect(() => {
    const checkAuthStatus = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const token = authService.getToken();
        const user = authService.getCurrentUser();

        if (token && user) {
          // Token varsa backend'den güncel profil bilgilerini al
          const response = await authService.getProfile();
          
          if (response.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.user,
                token: token,
              },
            });
          } else {
            // Profil bilgileri alınamazsa logout yap
            authService.logout();
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        authService.logout();
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuthStatus();
  }, []);

  // Login fonksiyonu
  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            token: response.token,
          },
        });
        return { success: true, message: response.message };
      } else {
        throw new Error(response.error || 'Giriş başarısız');
      }
    } catch (error) {
      const errorMessage = error.message || 'Giriş sırasında hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Register fonksiyonu
  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            token: response.token,
          },
        });
        return { success: true, message: response.message };
      } else {
        throw new Error(response.error || 'Kayıt başarısız');
      }
    } catch (error) {
      const errorMessage = error.message || 'Kayıt sırasında hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout fonksiyonu
  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Profil güncelleme
  const updateProfile = async (profileData) => {
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.user,
        });
        return { success: true, message: response.message };
      } else {
        throw new Error(response.error || 'Profil güncellenemedi');
      }
    } catch (error) {
      const errorMessage = error.message || 'Profil güncellenirken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Şifre değiştirme
  const changePassword = async (passwordData) => {
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await authService.changePassword(passwordData);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.error || 'Şifre değiştirilemedi');
      }
    } catch (error) {
      const errorMessage = error.message || 'Şifre değiştirilirken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Error temizleme
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Rol kontrolü helper fonksiyonları
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  const isSuperAdmin = () => hasRole('super_admin');
  const isDernekAdmin = () => hasRole('dernek_admin');
  const isUye = () => hasRole('uye');

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    
    // Helper functions
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isDernekAdmin,
    isUye,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;