// 共用的 API 回應介面定義

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiErrorResponse extends ApiResponse {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginationMeta {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface DeleteResponse {
  success: true;
  message: string;
  data: {
    ab_id: number;
    name: string;
  };
}