// List of api routes
// Single source of truth for api endpoints

export const API = {
    AUTH:{
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
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
} as const;