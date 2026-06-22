export interface AdminLoginRequestModel {
  userNameOrEmailAddress: string;
  password: string;
}

export interface AdminCurrentUserModel {
  id: string;
  userName: string;
  email: string | null;
  grantedPermissions: string[];
}

export interface AdminLoginResultModel {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  expiresAtUtc: string;
  user: AdminCurrentUserModel;
}

export interface StoredAdminSessionModel {
  accessToken: string;
  tokenType: string;
  expiresAtUtc: string;
  user: AdminCurrentUserModel;
}
