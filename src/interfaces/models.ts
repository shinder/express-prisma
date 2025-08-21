// 資料模型介面定義

export interface Contact {
  ab_id: number;
  name: string;
  email: string;
  mobile: string;
  birthday: Date | null;
  address: string;
  created_at: Date;
}

export interface Member {
  member_id: number;
  email: string;
  password_hash: string;
  mobile: string | null;
  nickname: string;
  create_at: Date;
}