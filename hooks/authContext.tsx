import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile, login as kakaoLogin, logout as kakaoLogout } from '@react-native-seoul/kakao-login';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        setUser(null);
      }
    };
    checkLoginStatus();
  }, []);

  const signInWithKakao = async () => {
    try {
      const token = await kakaoLogin();
      console.log('카카오 로그인 성공:', token);
      const profile = await getProfile();
      setUser(profile);
      setError(null);
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await kakaoLogout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      setError(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signInWithKakao, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);