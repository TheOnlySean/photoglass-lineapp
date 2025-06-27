'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';

export default function DebugPage() {
  const [status, setStatus] = useState<any>({ initialized: false });
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>(['页面开始加载...']);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  useEffect(() => {
    addLog('useEffect 开始执行');
    
    const initAndTest = async () => {
      try {
        addLog('=== 开始LIFF调试 ===');
        addLog(`当前URL: ${window.location.href}`);
        addLog(`User Agent: ${navigator.userAgent.substring(0, 100)}...`);
        
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        addLog(`LIFF ID: ${liffId || 'undefined'}`);

        if (!liffId) {
          throw new Error('LIFF ID未设置');
        }

        addLog('开始初始化LIFF...');
        await liff.init({
          liffId,
          withLoginOnExternalBrowser: false,
        });

        addLog('✅ LIFF初始化完成');
        
        const statusInfo = {
          isInClient: liff.isInClient(),
          isLoggedIn: liff.isLoggedIn(),
          liffId: liffId,
          initialized: true,
        };

        setStatus(statusInfo);
        addLog(`LIFF状态: ${JSON.stringify(statusInfo)}`);

        if (!liff.isLoggedIn()) {
          addLog('用户未登录，尝试登录...');
          await liff.login();
          addLog('登录完成');
        }

        addLog('尝试获取用户资料...');
        const profile = await liff.getProfile();
        addLog(`✅ 用户资料获取成功`);
        
        setStatus((prev: any) => ({ ...prev, profile }));

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        addLog(`❌ 错误: ${errorMsg}`);
        setError(errorMsg);
        
        if (err instanceof Error) {
          addLog(`错误类型: ${err.name}`);
          if (err.stack) {
            addLog(`错误堆栈: ${err.stack.substring(0, 200)}...`);
          }
        }
        
        setStatus({
          error: errorMsg,
          liffId: process.env.NEXT_PUBLIC_LIFF_ID,
          initialized: false,
        });
      }
    };

    // 立即执行，不延迟
    initAndTest();
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">
          LIFF调试页面
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
            <h3 className="font-bold text-red-800">错误信息：</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-bold mb-2">LIFF状态：</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
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
            className="block w-full text-center bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            重新加载
          </button>
        </div>
      </div>
    </div>
  );
} 