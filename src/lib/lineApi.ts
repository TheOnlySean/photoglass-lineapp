import axios from 'axios';

const LINE_API_BASE_URL = 'https://api.line.me/v2';

export class LineApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'LineApiError';
  }
}

// LINE APIクライアントの設定
const createLineApiClient = () => {
  const channelSecret = process.env.CHANNEL_SECRET;

  if (!channelSecret) {
    throw new LineApiError('Channel Secret is required for server-side operations');
  }

  return axios.create({
    baseURL: LINE_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${channelSecret}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
};

// ユーザープロフィール取得（サーバーサイド）
export const getLineUserProfile = async (userId: string) => {
  try {
    const client = createLineApiClient();
    const response = await client.get(`/bot/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get LINE user profile:', error);
    if (axios.isAxiosError(error)) {
      throw new LineApiError(
        `Failed to get user profile: ${error.message}`,
        error.response?.status
      );
    }
    throw new LineApiError('Failed to get user profile');
  }
};

// メッセージ送信（将来の機能拡張用）
export const sendLineMessage = async (userId: string, message: string) => {
  try {
    const client = createLineApiClient();
    const response = await client.post('/bot/message/push', {
      to: userId,
      messages: [
        {
          type: 'text',
          text: message,
        },
      ],
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send LINE message:', error);
    if (axios.isAxiosError(error)) {
      throw new LineApiError(`Failed to send message: ${error.message}`, error.response?.status);
    }
    throw new LineApiError('Failed to send message');
  }
};

// LIFF IDの検証
export const validateLiffId = (liffId: string): boolean => {
  // LIFF IDの形式: xxxxxxxxxx-xxxxxxxx
  const liffIdPattern = /^\d{10}-[a-zA-Z0-9]{8}$/;
  return liffIdPattern.test(liffId);
};

// Channel IDの検証
export const validateChannelId = (channelId: string): boolean => {
  // Channel IDの形式: 10桁の数字
  const channelIdPattern = /^\d{10}$/;
  return channelIdPattern.test(channelId);
}; 