// List of api routes
// Single source of truth for api endpoints

export const API = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
    RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
  },


  USERS: {
    BY_ID: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/update/${id}`,
  },
  

  ADMIN: {

    USERS: {
      BASE: "/api/admin/users",          // GET list, POST create
      CREATE: "/api/admin/users",        // POST
      LIST: "/api/admin/users",          // GET
      BY_ID: (id: string) => `/api/admin/users/${id}`, // GET/PUT/DELETE
      UPDATE: (id: string) => `/api/admin/users/${id}`, // PUT/PATCH
      DELETE: (id: string) => `/api/admin/users/${id}`, // DELETE
    },
  },
  ITEMS: {
    CREATE: "/api/items",
    ALL: "/api/items",
    BY_ID: (id: string) => `/api/items/${id}`,
    BY_SELLER: (sellerId: string) => `/api/items/user/${sellerId}`,
    UPDATE: (id: string) => `/api/items/${id}`,
    DELETE: (id: string) => `/api/items/${id}`,
  },
} as const;