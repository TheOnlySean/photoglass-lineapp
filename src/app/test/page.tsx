'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    // 显示当前URL和环境信息
    const currentInfo = {
      currentUrl: window.location.href,
      origin: window.location.origin,
      liffId: process.env.NEXT_PUBLIC_LIFF_ID,
      userAgent: navigator.userAgent,
      isInLineApp: navigator.userAgent.includes('Line'),
    };
    
    setInfo(currentInfo);
    console.log('Current page info:', currentInfo);
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">LIFF测试页面</h1>
        
        <div className="space-y-3">
          <div>
            <strong>当前URL:</strong>
            <p className="text-sm break-all text-gray-600">{info.currentUrl}</p>
          </div>
          
          <div>
            <strong>Origin:</strong>
            <p className="text-sm text-gray-600">{info.origin}</p>
          </div>
          
          <div>
            <strong>LIFF ID:</strong>
            <p className="text-sm text-gray-600">{info.liffId || 'undefined'}</p>
          </div>
          
          <div>
            <strong>在LINE应用内:</strong>
            <p className="text-sm text-gray-600">{info.isInLineApp ? 'Yes' : 'No'}</p>
          </div>
          
          <div>
            <strong>User Agent:</strong>
            <p className="text-xs text-gray-500 break-all">{info.userAgent}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            返回主页
          </a>
        </div>
      </div>
    </div>
  );
} 