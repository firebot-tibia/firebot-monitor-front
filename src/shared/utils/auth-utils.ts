import Cookies from 'js-cookie';
import jwtDecode from 'jsonwebtoken';
import { DecodedToken } from '../dtos/auth.dto';

export const setTokenWithExpiry = (token: string) => {
  try {
    const decodedToken = jwtDecode.decode(token) as DecodedToken;
    if (decodedToken?.exp) {
      const expiryDate = new Date(decodedToken.exp * 1000);
      const expiresInDays = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      Cookies.set('token', token, { expires: expiresInDays });
    } else {
      console.error('Token is invalid or does not contain an expiration time.');
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
};

export const isTokenValid = (token: string): boolean => {
  try {
    const decodedToken = jwtDecode.decode(token) as DecodedToken;
    return decodedToken && Date.now() < decodedToken.exp * 1000;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

export const isTokenExpired = (token: string) => {
    try {
      const decoded = jwtDecode.decode(token) as DecodedToken;
      if (!decoded || !decoded.exp) {
        return true;
      }
      const expiry = decoded.exp * 1000;
      return Date.now() > expiry;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };