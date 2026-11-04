import bcrypt from 'bcryptjs';
import { User, UserRole } from '../types';

export interface LoginResponse {
  message?: string;
  token?: string;
  user?: User;
  require_password_change?: boolean;
  status_code?: number;
  temporary_token?: string;
  error?: string;
}

export interface ChangePasswordResponse {
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

interface StoredAuthUser {
  id: string;
  nim: string;
  name: string;
  password: string; // bcrypt hash
  defaultPass: string;
  role: UserRole;
  is_first_login: boolean;
  title: string;
  class_code?: string;
  avatar?: string;
}

// Master credential roster matching server-users.json
const DEFAULT_AUTH_USERS: StoredAuthUser[] = [
  {
    id: 'usr-bph-1',
    nim: '1525020016',
    name: 'Aisyah Liuy Wulandari',
    password: '$2b$10$e0pYQuPuM9tgmJdSkXCp8uiPMrPWaLiEFU9vvUtzP8aKCAoOja4mC',
    defaultPass: 'bph_inti',
    role: 'bph_inti',
    is_first_login: true,
    title: 'Ketua Himpunan Cinemind',
    class_code: 'P PRDC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-bph-2',
    nim: '1525020028',
    name: 'Hafidz Sazili',
    password: '$2b$10$H89xR9K68D5V9vH9VB4w8eLRB/xQce7JuCMzKVXksmI6P9oRSn45G',
    defaultPass: 'bph_inti',
    role: 'bph_inti',
    is_first_login: true,
    title: 'Wakil Ketua Himpunan',
    class_code: 'P VMC',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-sekre-1',
    nim: '1525020042',
    name: 'Aileen Izza Salim',
    password: '$2b$10$rjA5TrXx6uLeGrDnkObuWeftomP4s8CtmsgNaZxV9aSdkix/iDjii',
    defaultPass: 'bph_sekretaris',
    role: 'bph_sekretaris',
    is_first_login: true,
    title: 'Sekretaris Himpunan',
    class_code: 'P CDA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-benda-1',
    nim: '1525020052',
    name: 'Abdan Syakuro Dwi Indrako',
    password: '$2b$10$ruot7R2jhQIYvsCQkKmUdesF123inRpky1fWcDMQDC7ayfV98Dhfy',
    defaultPass: 'bph_bendahara',
    role: 'bph_bendahara',
    is_first_login: true,
    title: 'Bendahara I Himpunan',
    class_code: 'P CDA',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-benda-2',
    nim: '1525020041',
    name: 'Zazkya Shelomita Anjani',
    password: '$2b$10$iJNmb1N6LMMroW/ddnyzd.Wf2S/L/lvyy1qocohdiVYBcvIgDKzPS',
    defaultPass: 'bph_bendahara',
    role: 'bph_bendahara',
    is_first_login: true,
    title: 'Bendahara II Himpunan',
    class_code: 'P PRDC',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-medinfo-1',
    nim: '1525020030',
    name: 'Muhammad Hilman Al Ghazy',
    password: '$2b$10$v7EDmRCffqY92yj7CZsuZOxuSZykHrq7lDC/WiawpZlY3Vll2xo9S',
    defaultPass: 'admin_medinfo',
    role: 'admin_medinfo',
    is_first_login: true,
    title: 'Kepala Divisi Media & Informasi',
    class_code: 'P CDA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
];

const LOCAL_USERS_KEY = 'cinemind_auth_users';

function getStoredUsers(): StoredAuthUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored users:', e);
  }
  return DEFAULT_AUTH_USERS;
}

function saveStoredUsers(users: StoredAuthUser[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage:', e);
  }
}

/**
 * Client-Side Authentication Fallback.
 * Dipakai saat frontend berjalan di hosting statis (seperti culturz.my.id, GitHub Pages,
 * atau ketika server backend Express tidak merespons / 405 Method Not Allowed).
 */
function clientSideLogin(nim: string, pass: string): LoginResponse {
  const users = getStoredUsers();
  const cleanNim = nim.trim();
  const cleanPass = pass.trim();

  const found = users.find((u) => u.nim === cleanNim);
  if (!found) {
    return {
      error: 'NIM pengurus tidak terdaftar dalam sistem SIM Cinemind.',
      status_code: 401,
    };
  }

  // Verifikasi kata sandi dengan bcrypt (atau plaintext default)
  let isPasswordValid = false;
  try {
    if (found.password.startsWith('$2')) {
      isPasswordValid = bcrypt.compareSync(cleanPass, found.password);
    }
  } catch {
    isPasswordValid = false;
  }

  if (!isPasswordValid && (cleanPass === found.defaultPass || cleanPass === found.password)) {
    isPasswordValid = true;
  }

  if (!isPasswordValid) {
    return {
      error: 'Kata sandi tidak valid. Pastikan kombinasi NIM dan kata sandi benar.',
      status_code: 401,
    };
  }

  const userModel: User = {
    id: found.id,
    nim: found.nim,
    name: found.name,
    role: found.role,
    title: found.title,
    classCode: found.class_code,
    avatar: found.avatar,
    is_first_login: found.is_first_login,
  };

  // Kebijakan HTTP 428 Precondition Required untuk login pertama
  if (found.is_first_login) {
    const temporaryToken = `temp_jwt_${found.id}_${Date.now()}`;
    return {
      require_password_change: true,
      status_code: 428,
      temporary_token: temporaryToken,
      user: userModel,
      message: 'Autentikasi awal berhasil. Kebijakan keamanan HTTP 428 mewajibkan pembaruan kata sandi awal.',
    };
  }

  // Login normal (200 OK)
  const token = `jwt_${found.id}_${Date.now()}`;
  return {
    token,
    user: userModel,
    message: 'Login berhasil (Client Authentication Fallback)',
    status_code: 200,
  };
}

function clientSideChangePassword(newPass: string, tempToken: string): ChangePasswordResponse {
  if (!newPass || newPass.trim().length < 6) {
    return { error: 'Kata sandi baru minimal harus terdiri dari 6 karakter.' };
  }

  // Ekstrak user id dari tempToken
  const users = getStoredUsers();
  let matchedUser: StoredAuthUser | undefined;

  for (const u of users) {
    if (tempToken.includes(u.id)) {
      matchedUser = u;
      break;
    }
  }

  if (!matchedUser) {
    // Fallback ke user pertama yang is_first_login === true
    matchedUser = users.find((u) => u.is_first_login) || users[0];
  }

  const newHash = bcrypt.hashSync(newPass.trim(), 10);
  const updatedUsers = users.map((u) => {
    if (u.id === matchedUser!.id) {
      return {
        ...u,
        password: newHash,
        is_first_login: false,
      };
    }
    return u;
  });

  saveStoredUsers(updatedUsers);

  const updatedModel: User = {
    id: matchedUser.id,
    nim: matchedUser.nim,
    name: matchedUser.name,
    role: matchedUser.role,
    title: matchedUser.title,
    classCode: matchedUser.class_code,
    avatar: matchedUser.avatar,
    is_first_login: false,
  };

  const finalToken = `jwt_${matchedUser.id}_${Date.now()}`;
  return {
    message: 'Kata sandi berhasil diperbarui.',
    token: finalToken,
    user: updatedModel,
  };
}

/**
 * Mendapatkan basis URL API.
 * 1. Mengutamakan VITE_API_BASE_URL dari environment variable (.env / build config).
 * 2. Mengembalikan string kosong jika belum disetel (relatif).
 */
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '';
};

/**
 * Helper untuk parsing respons HTTP secara aman, mencegah error "Unexpected token '<'".
 */
async function parseResponseSafely<T = any>(response: Response): Promise<{ data: T | null; errorText: string | null }> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const data = await response.json();
      return { data, errorText: null };
    } catch {
      return { data: null, errorText: 'Gagal mem-parsing payload JSON dari server.' };
    }
  }

  const rawText = await response.text();
  return { 
    data: null, 
    errorText: `Server mengembalikan konten non-JSON (${contentType || 'teks'}). Status: ${response.status} ${response.statusText}. Cuplikan: ${rawText.slice(0, 150)}` 
  };
}

export const AuthApi = {
  /**
   * POST /api/login
   * Mendukung hybrid: Mencoba server Express terlebih dahulu;
   * jika di-host di domain statis (misal culturz.my.id yang mengembalikan 405/404 atau offline),
   * otomatis beralih ke Client-Side Authentication dengan bcrypt.
   */
  async login(nim: string, password: string): Promise<LoginResponse> {
    const baseUrl = getApiBaseUrl();
    const isCustomStaticDomain = 
      typeof window !== 'undefined' && 
      (window.location.hostname.includes('culturz.my.id') || window.location.hostname.endsWith('github.io'));

    // Jika berjalan di domain statis tanpa backend URL yang disetel, langsung gunakan client-side auth
    if (!baseUrl && isCustomStaticDomain) {
      console.info('[CINEMIND] Domain statis terdeteksi (' + window.location.hostname + '). Menggunakan Client Authentication Engine.');
      return clientSideLogin(nim, password);
    }

    const endpoint = `${baseUrl}/api/login`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ nim: nim.trim(), password: password.trim() }),
      });

      // Jika server mengembalikan 405 Method Not Allowed (seperti Nginx/Apache di hosting statis) atau 404
      if (response.status === 405 || response.status === 404) {
        console.warn(`[CINEMIND] Endpoint login mengembalikan HTTP ${response.status}. Mengaktifkan fallback autentikasi lokal.`);
        return clientSideLogin(nim, password);
      }

      const { data, errorText } = await parseResponseSafely<any>(response);

      if (errorText || !data) {
        console.warn('[CINEMIND] Respons server non-JSON. Beralih ke fallback autentikasi:', errorText);
        return clientSideLogin(nim, password);
      }

      // HTTP 428 Precondition Required
      if (response.status === 428 || data.require_password_change) {
        return {
          require_password_change: true,
          status_code: 428,
          temporary_token: data.temporary_token,
          user: data.user,
          message: data.message,
        };
      }

      if (!response.ok) {
        return {
          error: data.error || `Login gagal dengan status ${response.status}`,
          status_code: response.status,
        };
      }

      return {
        token: data.token,
        user: data.user,
        message: data.message,
        status_code: 200,
      };
    } catch (err: any) {
      console.warn('[CINEMIND] Gagal terhubung ke API server backend. Beralih ke Client-Side Authentication Fallback:', err);
      // Fallback otomatis saat offline atau tidak ada server backend
      return clientSideLogin(nim, password);
    }
  },

  /**
   * POST /api/change-password
   */
  async changePassword(password_baru: string, temporary_token: string): Promise<ChangePasswordResponse> {
    const baseUrl = getApiBaseUrl();
    const isCustomStaticDomain = 
      typeof window !== 'undefined' && 
      (window.location.hostname.includes('culturz.my.id') || window.location.hostname.endsWith('github.io'));

    if (!baseUrl && isCustomStaticDomain) {
      return clientSideChangePassword(password_baru, temporary_token);
    }

    const endpoint = `${baseUrl}/api/change-password`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${temporary_token}`,
        },
        body: JSON.stringify({
          password_baru: password_baru.trim(),
          temporary_token,
        }),
      });

      if (response.status === 405 || response.status === 404) {
        return clientSideChangePassword(password_baru, temporary_token);
      }

      const { data, errorText } = await parseResponseSafely<any>(response);

      if (errorText || !data) {
        return clientSideChangePassword(password_baru, temporary_token);
      }

      if (!response.ok) {
        return { error: data.error || 'Gagal mengubah kata sandi.' };
      }

      return {
        message: data.message,
        token: data.token,
        user: data.user,
      };
    } catch (err: any) {
      console.warn('[CINEMIND] Mengubah password via client fallback:', err);
      return clientSideChangePassword(password_baru, temporary_token);
    }
  },

  /**
   * GET /api/me
   */
  async getMe(token: string): Promise<User | null> {
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/api/me`;

    try {
      const response = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        const users = getStoredUsers();
        const found = users.find((u) => token.includes(u.id));
        return found
          ? {
              id: found.id,
              nim: found.nim,
              name: found.name,
              role: found.role,
              title: found.title,
              classCode: found.class_code,
              avatar: found.avatar,
              is_first_login: found.is_first_login,
            }
          : null;
      }
      const { data } = await parseResponseSafely<any>(response);
      return data?.user || null;
    } catch {
      const users = getStoredUsers();
      const found = users.find((u) => token.includes(u.id));
      return found
        ? {
            id: found.id,
            nim: found.nim,
            name: found.name,
            role: found.role,
            title: found.title,
            classCode: found.class_code,
            avatar: found.avatar,
            is_first_login: found.is_first_login,
          }
        : null;
    }
  },

  /**
   * GET /api/roster
   */
  async getRoster(): Promise<any[]> {
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/api/roster`;

    try {
      const response = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) {
        return getStoredUsers().map((u) => ({
          id: u.id,
          nim: u.nim,
          name: u.name,
          role: u.role,
          title: u.title,
          is_first_login: u.is_first_login,
          avatar: u.avatar,
        }));
      }
      const { data } = await parseResponseSafely<any>(response);
      return data?.users || [];
    } catch {
      return getStoredUsers().map((u) => ({
        id: u.id,
        nim: u.nim,
        name: u.name,
        role: u.role,
        title: u.title,
        is_first_login: u.is_first_login,
        avatar: u.avatar,
      }));
    }
  },

  /**
   * POST /api/reset-seeder
   */
  async resetSeeder(): Promise<boolean> {
    try {
      localStorage.removeItem(LOCAL_USERS_KEY);
      saveStoredUsers(DEFAULT_AUTH_USERS);
      const baseUrl = getApiBaseUrl();
      if (baseUrl) {
        await fetch(`${baseUrl}/api/reset-seeder`, { 
          method: 'POST',
          headers: { 'Accept': 'application/json' },
        });
      }
      return true;
    } catch {
      return false;
    }
  },
};
