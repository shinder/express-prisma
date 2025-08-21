// JWT 相關介面定義
import type { ApiResponse } from './api';
import type { Member } from './models';

export interface JwtPayload {
  member_id: number;
  email: string;
  nickname: string;
  mobile: string | null;
}

export interface LoginSuccessResponse extends ApiResponse {
  success: true;
  data: {
    member: Omit<Member, 'password_hash'>;
    token: string;
  };
}