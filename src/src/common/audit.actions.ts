export const auditActions = {
  user: {
    CREATE: 'USER_CREATE',
    CHANGE_PASSWORD: 'USER_CHANGE_PASSWORD',
    CHANGE_ROLES: 'USER_CHANGE_ROLES',
    CHANGE_ACTIVE_STATUS: 'USER_CHANGE_ACTIVE_STATUS',
  },
  company: {
    CREATE: 'COMPANY_CREATE',
  },
} as const;

export const action = {
  ...auditActions.user,
};