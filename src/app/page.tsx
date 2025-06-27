'use client';

import { useEffect, useState } from 'react';
import { initializeLiff, getUserProfile, shareMessage, closeLiff } from '@/lib/liff';
import { Profile } from '@line/liff';
import liff from '@line/liff';
import Link from 'next/link';

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        addLog('=== 开始LIFF初始化 ===');
        addLog(`LIFF ID: ${process.env.NEXT_PUBLIC_LIFF_ID}`);
        addLog(`当前URL: ${window.location.href}`);
        addLog(`User Agent: ${navigator.userAgent.substring(0, 100)}...`);
        addLog(`在LINE中: ${navigator.userAgent.includes('Line') ? 'Yes' : 'No'}`);
        
        // 设置初始调试信息
        setDebugInfo({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID,
          currentUrl: window.location.href,
          userAgent: navigator.userAgent,
          isInLineApp: navigator.userAgent.includes('Line'),
          timestamp: new Date().toISOString(),
        });
        
        // まずLIFFを初期化
        addLog('开始LIFF初始化...');
        await initializeLiff();
        addLog('✅ LIFF初始化成功');
        
        // 检查LIFF状态
        const liffStatus = {
          isInClient: liff.isInClient(),
          isLoggedIn: liff.isLoggedIn(),
        };
        addLog(`LIFF状态: isInClient=${liffStatus.isInClient}, isLoggedIn=${liffStatus.isLoggedIn}`);
        
        setDebugInfo((prev: any) => ({ ...prev, ...liffStatus, initialized: true }));
        
        // 直接使用LIFF API获取profile，绕过我们的错误处理
        addLog('尝试直接获取profile...');
        try {
          const directProfile = await liff.getProfile();
          addLog('✅ 直接获取profile成功');
          addLog(`用户名: ${directProfile.displayName}`);
          setProfile(directProfile);
          setDebugInfo((prev: any) => ({ ...prev, profileMethod: 'direct', profileSuccess: true }));
        } catch (directError) {
          addLog('❌ 直接获取profile失败');
          addLog(`直接获取错误: ${directError instanceof Error ? directError.message : String(directError)}`);
          
          // 如果直接获取失败，尝试我们的包装函数
          try {
            addLog('尝试包装函数获取profile...');
            const userProfile = await getUserProfile();
            addLog('✅ 包装函数获取profile成功');
            setProfile(userProfile);
            setDebugInfo((prev: any) => ({ ...prev, profileMethod: 'wrapper', profileSuccess: true }));
          } catch (wrapperError) {
            addLog('❌ 包装函数也失败');
            addLog(`包装函数错误: ${wrapperError instanceof Error ? wrapperError.message : String(wrapperError)}`);
            
            // 详细错误分析
            const errorDetails = wrapperError instanceof Error ? {
              name: wrapperError.name,
              message: wrapperError.message,
              stack: wrapperError.stack?.substring(0, 200),
            } : { message: String(wrapperError) };
            
            setError(`Profile获取失败: ${errorDetails.message}`);
            setDebugInfo((prev: any) => ({ 
              ...prev, 
              profileMethod: 'both_failed', 
              profileSuccess: false,
              lastError: errorDetails
            }));
          }
        }
      } catch (err) {
        addLog('❌ LIFF初始化失败');
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        addLog(`初始化错误: ${errorMessage}`);
        
        // 详细的错误信息记录
        if (err instanceof Error) {
          addLog(`错误类型: ${err.name}`);
          if (err.stack) {
            addLog(`错误堆栈: ${err.stack.substring(0, 200)}...`);
          }
        }
        
        setError(`LIFF初始化失败: ${errorMessage}`);
        setDebugInfo((prev: any) => ({ 
          ...prev, 
          initialized: false, 
          initError: errorMessage 
        }));
      } finally {
        setIsLoading(false);
        addLog('=== 初始化流程完成 ===');
      }
    };

    initializeApp();
  }, []);

  const handleShare = async () => {
    try {
      addLog('尝试分享消息...');
      await shareMessage('写真眼鏡アプリをテストしています！');
      addLog('✅ 分享成功');
    } catch (err) {
      addLog('❌ 分享失败');
      console.error('Share failed:', err);
    }
  };

  const handleClose = () => {
    addLog('关闭LIFF应用');
    closeLiff();
  };

  const handleManualProfileTest = async () => {
    try {
      addLog('=== 手动Profile测试开始 ===');
      addLog('检查LIFF状态...');
      
      const currentStatus = {
        isInClient: (window as any).liff?.isInClient(),
        isLoggedIn: (window as any).liff?.isLoggedIn(),
        liffReady: !!(window as any).liff,
      };
      
      addLog(`当前状态: ${JSON.stringify(currentStatus)}`);
      
      if (!currentStatus.liffReady) {
        throw new Error('LIFF未初始化');
      }
      
      if (!currentStatus.isInClient) {
        throw new Error('不在LINE客户端中');
      }
      
      if (!currentStatus.isLoggedIn) {
        addLog('用户未登录，尝试登录...');
        await (window as any).liff.login();
        addLog('登录完成');
      }
      
      addLog('尝试获取profile...');
      const profile = await (window as any).liff.getProfile();
      addLog('✅ 手动Profile获取成功');
      addLog(`用户名: ${profile.displayName}`);
      
      alert(`Profile获取成功!\n用户名: ${profile.displayName}\nID: ${profile.userId}`);
      
      // 更新profile状态
      setProfile(profile);
      setError(null);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addLog(`❌ 手动Profile测试失败: ${errorMsg}`);
      alert(`Profile获取失败: ${errorMsg}`);
    }
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">写真眼鏡</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold">错误信息：</h3>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}
        
        {profile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">ユーザー情報</h2>
            <div className="flex items-center space-x-4">
              {profile.pictureUrl && (
                <img src={profile.pictureUrl} alt="Profile" className="w-16 h-16 rounded-full" />
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

        {/* 调试信息面板 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2">🔍 调试信息</h3>
          <div className="text-xs space-y-1">
            <div><strong>LIFF ID:</strong> {debugInfo.liffId || 'undefined'}</div>
            <div><strong>初始化状态:</strong> {debugInfo.initialized ? '✅ 成功' : '❌ 失败'}</div>
            <div><strong>在LINE中:</strong> {debugInfo.isInLineApp ? '✅ 是' : '❌ 否'}</div>
            <div><strong>LIFF客户端:</strong> {debugInfo.isInClient ? '✅ 是' : '❌ 否'}</div>
            <div><strong>已登录:</strong> {debugInfo.isLoggedIn ? '✅ 是' : '❌ 否'}</div>
            <div><strong>Profile获取:</strong> {debugInfo.profileSuccess ? '✅ 成功' : '❌ 失败'}</div>
            {debugInfo.profileMethod && (
              <div><strong>获取方式:</strong> {debugInfo.profileMethod}</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleManualProfileTest}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            🧪 手动测试Profile获取
          </button>
          
          <button
            onClick={handleShare}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            📤 シェアテスト
          </button>
          
          <button
            onClick={handleClose}
            className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            ❌ アプリを閉じる
          </button>
        </div>

        {/* 详细日志 */}
        {logs.length > 0 && (
          <div className="mt-6 bg-black text-green-400 p-4 rounded-lg">
            <h3 className="text-white font-bold mb-2">📋 详细日志</h3>
            <div className="text-xs max-h-60 overflow-auto space-y-1">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">LIFF設定テストページ - Enhanced Debug Mode</p>
          <div className="mt-4 space-x-4">
            <Link 
              href="/privacy" 
              className="text-blue-500 hover:underline text-sm"
            >
              プライバシーポリシー
            </Link>
            <span className="text-gray-400">|</span>
            <Link 
              href="/terms" 
              className="text-blue-500 hover:underline text-sm"
            >
              利用規約
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 