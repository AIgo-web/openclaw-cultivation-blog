/**
 * 微信公众号 API 服务
 */

export interface WeChatServiceResponse {
  success: boolean;
  message?: string;
  media_id?: string;
  error?: string;
}

export interface WeChatAccount {
  name: string;
  appid: string;
}

const API_BASE = 'http://localhost:5001/api/wechat';

/**
 * 获取已配置的公众号账号
 */
export const getWeChatAccounts = async (): Promise<WeChatAccount[]> => {
  try {
    const response = await fetch(`${API_BASE}/accounts`);
    const data = await response.json();
    if (data.success && data.accounts) {
      return data.accounts as WeChatAccount[];
    }
    return [];
  } catch (error) {
    console.error('获取公众号账号失败:', error);
    return [];
  }
};

/**
 * 同步文章到微信公众号
 */
export const publishToWeChat = async (
  postId: string,
  account: string = 'AI养成笔记',
  defaultCover?: string
): Promise<WeChatServiceResponse> => {
  try {
    const response = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_id: postId,
        account,
        default_cover: defaultCover
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('同步到微信失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 添加新的公众号账号
 */
export const addWeChatAccount = async (
  name: string,
  appid: string,
  appsecret: string
): Promise<WeChatServiceResponse> => {
  try {
    const response = await fetch(`${API_BASE}/add_account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        appid,
        appsecret,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('添加公众号失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 删除公众号账号
 */
export const deleteWeChatAccount = async (name: string): Promise<WeChatServiceResponse> => {
  try {
    const response = await fetch(`${API_BASE}/delete_account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('删除公众号失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};
