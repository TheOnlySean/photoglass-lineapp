'use client';

import { useEffect, useState } from 'react';
import { initializeLiff } from '@/lib/liff';
import liff from '@line/liff';

export default function ProfileTestPage() {
  const [status, setStatus] = useState<any>({ step: 'starting' });
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>(['Profile Test Page Loaded']);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  useEffect(() => {
    const testProfile = async () => {
      try {
        addLog('=== 开始Profile测试 ===');
        
        // 步骤1: 初始化LIFF
        addLog('步骤1: 初始化LIFF...');
        await initializeLiff();
        addLog('✅ LIFF初始化成功');
        
        // 步骤2: 检查状态
        addLog('步骤2: 检查LIFF状态...');
        const isInClient = liff.isInClient();
        const isLoggedIn = liff.isLoggedIn();
        addLog(`isInClient: ${isInClient}`);
        addLog(`isLoggedIn: ${isLoggedIn}`);
        
        setStatus({
          step: 'liff-initialized',
          isInClient,
          isLoggedIn,
          liffId: process.env.NEXT_PUBLIC_LIFF_ID,
        });
        
        if (!isInClient) {
          throw new Error('Not in LINE client - please access via LIFF URL');
        }
        
        // 步骤3: 登录检查
        if (!isLoggedIn) {
          addLog('步骤3: 用户未登录，尝试登录...');
          await liff.login();
          addLog('登录完成');
          
          // 重新检查登录状态
          const loginStatus = liff.isLoggedIn();
          addLog(`登录后状态: ${loginStatus}`);
          
          if (!loginStatus) {
            throw new Error('Login failed - user still not logged in');
          }
        }
        
        // 步骤4: 获取Profile
        addLog('步骤4: 尝试获取用户Profile...');
        
        try {
          const profile = await liff.getProfile();
          addLog('✅ Profile获取成功!');
          addLog(`用户名: ${profile.displayName}`);
          addLog(`用户ID: ${profile.userId}`);
          
          setStatus((prev: any) => ({
            ...prev,
            step: 'success',
            profile: {
              displayName: profile.displayName,
              userId: profile.userId,
              pictureUrl: profile.pictureUrl,
              statusMessage: profile.statusMessage,
            }
          }));
          
        } catch (profileError) {
          addLog('❌ Profile获取失败');
          addLog(`Profile错误类型: ${profileError instanceof Error ? profileError.name : 'unknown'}`);
          addLog(`Profile错误消息: ${profileError instanceof Error ? profileError.message : 'unknown'}`);
          
          if (profileError instanceof Error && profileError.stack) {
            addLog(`Profile错误堆栈: ${profileError.stack.substring(0, 200)}...`);
          }
          
          throw profileError;
        }
        
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        addLog(`❌ 测试失败: ${errorMsg}`);
        setError(errorMsg);
        
        if (err instanceof Error) {
          addLog(`错误类型: ${err.name}`);
          if (err.stack) {
            addLog(`错误堆栈: ${err.stack.substring(0, 300)}...`);
          }
        }
        
        setStatus((prev: any) => ({
          ...prev,
          step: 'failed',
          error: errorMsg,
        }));
      }
    };

    testProfile();
  }, []);

  return (
    <div className="min-h-screen p-4 bg-purple-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-purple-600">
          Profile获取测试
        </h1>

        <div className="mb-4 p-3 bg-purple-100 rounded">
          <p className="text-purple-800">
            🧪 专门测试用户Profile获取功能
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
            <h3 className="font-bold text-red-800">错误信息：</h3>
            <p className="text-red-700 text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-bold mb-2">当前状态：</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-2">详细日志：</h3>
          <div className="bg-black text-green-400 p-3 rounded text-xs max-h-60 overflow-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <a 
            href="/" 
            className="block w-full text-center bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            返回主页
          </a>
          
          <button
            onClick={() => window.location.reload()}
            className="block w-full text-center bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            重新测试
          </button>
        </div>
      </div>
    </div>
  );
} 