'use client';

import { useEffect, useState } from 'react';
import { getUserProfile, shareMessage, closeLiff } from '@/lib/liff';

export default function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    // LIFF初期化後にプロフィールを取得
    const timer = setTimeout(() => {
      loadProfile();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    try {
      await shareMessage('写真眼鏡アプリをテストしています！');
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleClose = () => {
    closeLiff();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">写真眼鏡</h1>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">エラー</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">写真眼鏡</h1>
        
        {profile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">ユーザー情報</h2>
            <div className="flex items-center space-x-4">
              {profile.pictureUrl && (
                <img
                  src={profile.pictureUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{profile.displayName}</p>
                {profile.statusMessage && (
                  <p className="text-gray-600 text-sm">{profile.statusMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleShare}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            シェアテスト
          </button>
          
          <button
            onClick={handleClose}
            className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            アプリを閉じる
          </button>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">LIFF設定テストページ</p>
        </div>
      </div>
    </div>
  );
} 