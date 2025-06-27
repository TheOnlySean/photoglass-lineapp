import liff from '@line/liff';

export class LiffError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LiffError';
  }
}

export const initializeLiff = async (): Promise<void> => {
  try {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    console.log('Initializing LIFF with ID:', liffId);

    if (!liffId) {
      throw new LiffError('LIFF ID is required. Please check environment variables.');
    }

    await liff.init({
      liffId,
      withLoginOnExternalBrowser: false,
    });

    console.log('LIFF initialization completed successfully');
    console.log('Is in client:', liff.isInClient());
    console.log('Is logged in:', liff.isLoggedIn());

    // ログインしていない場合は自動ログイン
    if (!liff.isLoggedIn()) {
      console.log('User not logged in, attempting to login...');
      await liff.login();
    }
  } catch (error) {
    console.error('LIFF initialization error:', error);
    throw new LiffError(`LIFF initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getUserProfile = async () => {
  try {
    console.log('Getting user profile...');
    console.log('Is LIFF initialized:', 'ready');
    console.log('Is in client:', liff.isInClient());
    console.log('Is logged in:', liff.isLoggedIn());

    // 检查是否在LIFF客户端内
    if (!liff.isInClient()) {
      throw new LiffError('Not in LINE client. Please access via LIFF URL.');
    }

    if (!liff.isLoggedIn()) {
      console.log('User is not logged in, attempting to login...');
      await liff.login();
      console.log('Login completed, checking login status again...');
      console.log('Is logged in after login:', liff.isLoggedIn());
    }

    console.log('Attempting to get profile...');
    const profile = await liff.getProfile();
    console.log('Profile retrieved successfully:', profile);
    return profile;
  } catch (error) {
    console.error('Get profile error details:', error);
    console.error('Error type:', typeof error);
    console.error('Error name:', error instanceof Error ? error.name : 'unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'unknown');
    
    // 更详细的错误信息
    if (error instanceof Error) {
      if (error.message.includes('forbidden') || error.message.includes('permission') || error.message.includes('scope')) {
        throw new LiffError('权限不足：请在LINE Console中为此LIFF应用添加"profile"权限。');
      }
      if (error.message.includes('network') || error.message.includes('timeout')) {
        throw new LiffError('网络错误：请检查网络连接后重试。');
      }
      if (error.message.includes('login') || error.message.includes('auth')) {
        throw new LiffError('登录失败：请重新打开LIFF应用。');
      }
    }
    
    throw new LiffError(`获取用户资料失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
};

export const shareMessage = async (text: string, imageUrl?: string) => {
  try {
    if (!liff.isInClient()) {
      throw new LiffError('This feature is only available in LINE app');
    }

    const messages: Array<{ type: string; text?: string; originalContentUrl?: string; previewImageUrl?: string }> = [
      {
        type: 'text',
        text: text,
      },
    ];

    // 画像がある場合は追加
    if (imageUrl) {
      messages.push({
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl,
      });
    }

    await liff.shareTargetPicker(messages);
  } catch (error) {
    throw new LiffError('Failed to share message');
  }
};

export const closeLiff = () => {
  try {
    if (!liff.isInClient()) {
      throw new LiffError('This feature is only available in LINE app');
    }
    liff.closeWindow();
  } catch (error) {
    throw new LiffError('Failed to close LIFF');
  }
};

// Mini App特有の機能
export const openExternalBrowser = (url: string) => {
  try {
    if (!liff.isInClient()) {
      window.open(url, '_blank');
      return;
    }
    liff.openWindow({
      url: url,
      external: true,
    });
  } catch (error) {
    window.open(url, '_blank');
  }
}; 