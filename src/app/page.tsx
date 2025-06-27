'use client';

import { useEffect, useState } from 'react';
import { initializeLiff } from '@/lib/liff';
import Link from 'next/link';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeLiff();
      } catch (err) {
        console.error('LIFF initialization error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`初期化エラー: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">写真眼鏡</h1>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="text-center pt-12 pb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">写真眼鏡</h1>
          <p className="text-gray-600 text-lg">
            小さな文字も大きく見える！
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mx-4 mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* 主要拍照区域 */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center">
            {/* 卡通放大镜拍照按钮 */}
            <div className="relative mx-auto w-80 h-80 mb-12">
              <Link href="/camera" className="block">
                {/* 主圆形按钮 */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-2xl transform hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <div className="absolute inset-6 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full flex items-center justify-center">
                    <span className="text-7xl font-bold text-red-500">撮</span>
                  </div>
                  {/* 放大镜把手 */}
                  <div className="absolute -bottom-10 -right-10 w-20 h-28 bg-gradient-to-b from-red-400 to-red-600 rounded-full transform rotate-45 shadow-lg"></div>
                </div>
                
                {/* 装饰性动画元素 */}
                <div className="absolute -top-6 -left-6 w-10 h-10 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="absolute -top-4 -right-10 w-8 h-8 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-6 -left-10 w-12 h-12 bg-green-400 rounded-full animate-bounce delay-300"></div>
                <div className="absolute top-1/4 -right-8 w-6 h-6 bg-purple-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/4 -left-6 w-8 h-8 bg-orange-400 rounded-full animate-pulse delay-150"></div>
              </Link>
            </div>

            {/* 说明文字 */}
            <div className="space-y-4">
              <p className="text-xl font-bold text-gray-700">
                📸 写真を撮影してください
              </p>
              <p className="text-gray-600 leading-relaxed">
                文字の読み取りや<br/>
                画像の説明を行います
              </p>
            </div>
          </div>
        </div>

        {/* 底部功能链接 */}
        <div className="px-4 pb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              📖 このアプリについて
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔍</span>
                <span>小さな文字を大きく読み取り</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🤖</span>
                <span>AI による画像の詳細説明</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔊</span>
                <span>音声での読み上げ機能</span>
              </div>
            </div>
          </div>
        </div>

        {/* 法律文档链接 */}
        <div className="px-4 pb-6">
          <div className="flex justify-center space-x-6 text-sm">
            <Link 
              href="/privacy" 
              className="text-blue-500 hover:underline"
            >
              プライバシーポリシー
            </Link>
            <span className="text-gray-400">|</span>
            <Link 
              href="/terms" 
              className="text-blue-500 hover:underline"
            >
              利用規約
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 