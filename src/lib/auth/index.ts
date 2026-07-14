export { useAuthSession } from "./useAuthSession";
export { AUTH_CHANGE_EVENT, notifyAuthChange } from "./events";
export { authStorage } from "./storage";
export { authService } from "./service";



import { authService } from "./service";

import { authStorage } from "./storage";



export const sendEmailCode = (form: { email: string }) => authService.sendEmailCode(form);



export const loginWithEmailCode = (form: { email: string; code: string }) =>

  authService.loginWithEmailCode(form);



export const startGoogleLogin = () => authService.startGoogleLogin();



export const socialLogin = (form: { type?: number; code: string; state: string; redirectUri?: string }) =>

  authService.socialLogin(form);



export const logout = () => authService.logout();



export const isAuthenticated = () => authService.isAuthenticated();



export const getStoredAuth = () => authStorage.getSession();


