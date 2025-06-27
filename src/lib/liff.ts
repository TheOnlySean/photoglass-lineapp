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
    
    if (!liffId) {
      throw new LiffError('LIFF ID is required');
    }

    await liff.init({
      liffId,
      withLoginOnExternalBrowser: false,
    });

    console.log('LIFF initialized successfully');
    console.log('Is in client:', liff.isInClient());
    console.log('Is logged in:', liff.isLoggedIn());

  } catch (error) {
    console.error('LIFF initialization failed:', error);
    throw new LiffError('LIFF initialization failed');
  }
};

export const getUserProfile = async () => {
  try {
    if (!liff.isLoggedIn()) {
      throw new LiffError('User is not logged in');
    }

    const profile = await liff.getProfile();
    return profile;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    throw new LiffError('Failed to get user profile');
  }
};

export const shareMessage = async (text: string, imageUrl?: string) => {
  try {
    if (!liff.isInClient()) {
      throw new LiffError('This feature is only available in LINE app');
    }

    const messages: any[] = [
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
    console.error('Failed to share message:', error);
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
    console.error('Failed to close LIFF:', error);
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
    console.error('Failed to open external browser:', error);
    window.open(url, '_blank');
  }
}; 