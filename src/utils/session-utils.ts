import type { Request } from 'express';

/**
 * Promise 化的 session.save() 方法
 * 確保 session 資料完全寫入儲存媒介後才繼續執行
 */
export const saveSessionAsync = (req: Request): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Promise 化的 session.destroy() 方法
 * 確保 session 完全銷毀後才繼續執行
 */
export const destroySessionAsync = (req: Request): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Promise 化的 session.reload() 方法
 * 從儲存媒介重新載入 session 資料
 */
export const reloadSessionAsync = (req: Request): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.reload((err) => {
      if (err) {
        console.error('Session reload error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * 安全地設定 session 資料並確保儲存
 * @param req Express Request 物件
 * @param data 要設定的 session 資料
 */
export const setSessionDataAsync = async (req: Request, data: any): Promise<void> => {
  // 設定 session 資料
  Object.assign(req.session, data);
  
  // 確保儲存完成
  await saveSessionAsync(req);
};

/**
 * 安全地清除特定 session 欄位
 * @param req Express Request 物件
 * @param keys 要清除的欄位名稱陣列
 */
export const clearSessionFieldsAsync = async (req: Request, keys: string[]): Promise<void> => {
  // 清除指定欄位
  keys.forEach(key => {
    delete (req.session as any)[key];
  });
  
  // 確保儲存完成
  await saveSessionAsync(req);
};

/**
 * 檢查 session 是否包含特定資料
 * @param req Express Request 物件
 * @param key 要檢查的欄位名稱
 */
export const hasSessionData = (req: Request, key: string): boolean => {
  return !!(req.session as any)[key];
};

/**
 * 取得 session 中的特定資料
 * @param req Express Request 物件
 * @param key 要取得的欄位名稱
 */
export const getSessionData = <T = any>(req: Request, key: string): T | undefined => {
  return (req.session as any)[key];
};