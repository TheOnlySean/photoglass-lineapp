'use client';

import { useEffect, useState } from 'react';

export default function SimplePage() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    const pageInfo = {
      currentUrl: window.location.href,
      origin: window.location.origin,
      host: window.location.host,
      pathname: window.location.pathname,
      liffId: process.env.NEXT_PUBLIC_LIFF_ID,
      userAgent: navigator.userAgent,
      isInLineApp: navigator.userAgent.includes('Line'),
      timestamp: new Date().toISOString(),
    };
    
    setInfo(pageInfo);
    console.log('Simple page info:', pageInfo);
  }, []);

  return (
    <div className="min-h-screen p-4 bg-blue-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">
          简单测试页面
        </h1>
        
        <div className="space-y-3 text-sm">
          <div>
            <strong>当前时间:</strong>
            <p className="text-gray-600">{info.timestamp}</p>
          </div>
          
          <div>
            <strong>当前URL:</strong>
            <p className="text-gray-600 break-all">{info.currentUrl}</p>
          </div>
          
          <div>
            <strong>Host:</strong>
            <p className="text-gray-600">{info.host}</p>
          </div>
          
          <div>
            <strong>Path:</strong>
            <p className="text-gray-600">{info.pathname}</p>
          </div>
          
          <div>
            <strong>LIFF ID:</strong>
            <p className="text-gray-600">{info.liffId || 'undefined'}</p>
          </div>
          
          <div>
            <strong>在LINE应用内:</strong>
            <p className="text-gray-600">{info.isInLineApp ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <a 
            href="/" 
            className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            返回主页
          </a>
          
          <a 
            href="/test" 
            className="block w-full text-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            测试页面
          </a>
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p><strong>说明:</strong> 这是一个不包含LIFF初始化的简单页面，用于测试基本的Next.js功能是否正常。</p>
        </div>
      </div>
    </div>
  );
} 