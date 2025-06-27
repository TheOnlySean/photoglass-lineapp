'use client';

import { useState } from 'react';
import liff from '@line/liff';

export default function SafeDebugPage() {
  const [status, setStatus] = useState<any>({ ready: false });
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>(['安全调试页面已加载']);
  const [isInitializing, setIsInitializing] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const checkEnvironment = () => {
    addLog('=== 环境检查 ===');
    addLog(`当前URL: ${window.location.href}`);
    addLog(`User Agent: ${navigator.userAgent}`);
    addLog(`在LINE中: ${navigator.userAgent.includes('Line') ? 'Yes' : 'No'}`);
    addLog(`LIFF ID: ${process.env.NEXT_PUBLIC_LIFF_ID || 'undefined'}`);
    
    setStatus({
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      isInLine: navigator.userAgent.includes('Line'),
      liffId: process.env.NEXT_PUBLIC_LIFF_ID,
      ready: true,
    });
  };

  const initializeLiff = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setError('');
    
    try {
      addLog('=== 开始LIFF初始化 ===');
      
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId) {
        throw new Error('LIFF ID未设置');
      }

      addLog('调用 liff.init()...');
      await liff.init({
        liffId,
        withLoginOnExternalBrowser: false,
      });

      addLog('✅ LIFF初始化成功');
      
      const liffStatus = {
        isInClient: liff.isInClient(),
        isLoggedIn: liff.isLoggedIn(),
      };
      
      addLog(`LIFF状态: ${JSON.stringify(liffStatus)}`);
      setStatus((prev: any) => ({ ...prev, ...liffStatus, initialized: true }));

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addLog(`❌ LIFF初始化失败: ${errorMsg}`);
      setError(errorMsg);
      
      if (err instanceof Error) {
        addLog(`错误类型: ${err.name}`);
        if (err.stack) {
          addLog(`错误详情: ${err.stack.substring(0, 300)}`);
        }
      }
      
      setStatus((prev: any) => ({ ...prev, error: errorMsg, initialized: false }));
    } finally {
      setIsInitializing(false);
    }
  };

  const tryGetProfile = async () => {
    try {
      addLog('=== 尝试获取用户资料 ===');
      
      if (!liff.isLoggedIn()) {
        addLog('用户未登录，尝试登录...');
        await liff.login();
      }

      const profile = await liff.getProfile();
      addLog(`✅ 用户资料获取成功: ${profile.displayName}`);
      setStatus((prev: any) => ({ ...prev, profile }));

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addLog(`❌ 获取用户资料失败: ${errorMsg}`);
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-blue-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">
          安全LIFF调试页面
        </h1>

        <div className="mb-4 p-3 bg-blue-100 rounded">
          <p className="text-blue-800">
            📋 这个页面不会自动初始化LIFF，避免400错误跳转
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
            <h3 className="font-bold text-red-800">错误信息：</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6 space-y-2">
          <button
            onClick={checkEnvironment}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            1. 检查环境信息
          </button>
          
          <button
            onClick={initializeLiff}
            disabled={isInitializing}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400"
          >
            {isInitializing ? '初始化中...' : '2. 初始化LIFF'}
          </button>
          
          <button
            onClick={tryGetProfile}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            3. 获取用户资料
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-2">状态信息：</h3>
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
            className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            返回主页
          </a>
          
          <button
            onClick={() => window.location.reload()}
            className="block w-full text-center bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            重新加载页面
          </button>
        </div>
      </div>
    </div>
  );
} 