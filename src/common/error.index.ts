export const errorCode = {
  apiCommon: {
    unauthorized: 'API30001',
    internalServerError: 'API30002',
    badRequest: 'API30003',
    invalidTenant: 'API30005',
    forbidden: 'API30007',
    notFound: 'API30008',
  },
  auth: {
    invalidCredentials: 'AUTH10001',
    accountDisabled: 'AUTH10002',
    invalidRefreshToken: 'AUTH10003',
    invalidToken: 'AUTH10004',
  },
  user: {
    notFound: 'USER10001',
    duplicateUsernameOrEmail: 'USER10002',
    inactiveUser: 'USER10003',
  },
  company: {
    duplicateCompanyIdentifier: 'COMPANY10001',
  },
  owner: {
    duplicateOwnerIdentifier: 'OWNER10001',
    duplicateTdsTruckNumber: 'OWNER10002',
  },
  truck: {
    duplicateTruckIdentifier: 'TRUCK10001',
    tdsTruckLimitExceeded: 'TRUCK10002',
  },
  driver: {
    duplicateDriverIdentifier: 'DRIVER10001',
  },
  bankDetails: {
    duplicateBankAccount: 'BANK10001',
  },
  client: {
    duplicateClientIdentifier: 'CLIENT10001',
  },
  clientBranch: {
    duplicateBranchIdentifier: 'CLIENTBRANCH10001',
  },
  dealer: {
    duplicateDealerCode: 'DEALER10001',
  },
  deliveryChallan: {
    duplicateDcNumber: 'DC10001',
  },
} as const;

export const codes = {
  ...errorCode.apiCommon,
  ...errorCode.auth,
  ...errorCode.user,
  ...errorCode.company,
  ...errorCode.owner,
  ...errorCode.truck,
  ...errorCode.driver,
  ...errorCode.bankDetails,
  ...errorCode.client,
  ...errorCode.clientBranch,
  ...errorCode.dealer,
  ...errorCode.deliveryChallan,
};