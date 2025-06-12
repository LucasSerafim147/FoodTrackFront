import { saveItem, deleteItem, getItem } from '@/hooks/secureStorage';

const API_URL = 'http://localhost:3000/api';

export const login = async (email: string, senha: string) => {
  try {
    console.log('Enviando para login:', { email, senha });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    console.log('Resposta do servidor (login):', { status: response.status, data });
    console.log('Token recebido (login):', data.token);
    if (response.ok) {
      if (typeof data.token !== 'string' || !data.token) {
        console.error('Token inválido:', data.token);
        return { success: false, message: 'Token inválido retornado pelo servidor' };
      }
      await saveItem('token', data.token);
      return { success: true };
    } else {
      return { success: false, message: data.message || 'Erro ao fazer login' };
    }
  } catch (error) {
    console.error('Erro na requisição (login):', error);
    return { success: false, message: 'Erro de rede ou timeout' };
  }
};

export const register = async (nome: string, email: string, senha: string) => {
  try {
    console.log('Enviando para register:', { nome, email, senha });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    console.log('Resposta do servidor (register):', { status: response.status, data });
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, message: data.message || 'Erro ao registrar' };
    }
  } catch (error) {
    console.error('Erro na requisição (register):', error);
    return { success: false, message: 'Erro de rede ou timeout' };
  }
};

export const logout = async () => {
  await deleteItem('token');
};

export const getToken = async () => {
  const token = await getItem('token');
  console.log('Token recuperado:', token);
  return token;
};

export const isTokenValid = async () => {
  const token = await getToken();
  console.log('Validando token:', token);
  if (!token) {
    console.log('Nenhum token encontrado');
    return false;
  }
  return true;
};

export const getMeals = async () => {
  try {
    const token = await getToken();
    console.log('Token para getMeals:', token);
    if (!token) {
      return { success: false, message: 'Nenhum token encontrado' };
    }
    // Extração simplificada do userId (assumindo que o backend usa req.userId)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${API_URL}/meals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    console.log('Resposta bruta de getMeals:', data);
    console.log('Resposta de getMeals:', { status: response.status, data });
    if (response.ok) {
      return { success: true, meals: data.meals || data };
    } else {
      return { success: false, message: data.message || 'Erro ao buscar refeições' };
    }
  } catch (error) {
    console.error('Erro na requisição de meals:', error);
    return { success: false, message: 'Erro de rede ou timeout' };
  }
};