'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { initializeLiff } from '@/lib/liff';
import Link from 'next/link';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeLiff();
        
        // 检查相机支持
        if (typeof navigator !== 'undefined' && 
            navigator.mediaDevices && 
            typeof navigator.mediaDevices.getUserMedia === 'function') {
          setCameraSupported(true);
        }
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

  // 启动相机（Web API方式）
  const startCamera = useCallback(async () => {
    try {
      setError('');
      console.log('Attempting to start camera...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('このブラウザはカメラ機能をサポートしていません');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 后置摄像头
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      console.log('Camera stream obtained successfully');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('カメラへのアクセスに失敗しました。代わりにファイル選択をご利用ください。');
      // 自动打开文件选择器作为备用方案
      handleFileUpload();
    }
  }, []);

  // 文件上传方式（备用方案）
  const handleFileUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // 处理文件选择
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);
        analyzeImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // 停止相机
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  // 拍照
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // 设置canvas尺寸与video相同
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 绘制当前视频帧到canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 转换为base64图片
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    
    // 停止相机
    stopCamera();
    
    // 自动开始AI分析
    analyzeImage(imageDataUrl);
  }, [stopCamera]);

  // AI文字识别
  const analyzeImage = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('AI分析に失敗しました');
      }

      const result = await response.json();
      setRecognizedText(result.text || '内容を認識できませんでした');
    } catch (err) {
      setError('AI分析中にエラーが発生しました。もう一度お試しください。');
      console.error('AI analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 音声读み上げ
  const speakText = () => {
    if (!recognizedText || recognizedText === '内容を認識できませんでした') return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(recognizedText);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // 重新拍照
  const retakePhoto = () => {
    setCapturedImage(null);
    setRecognizedText('');
    setError('');
  };

  // 主拍照按钮处理
  const handleMainCameraButton = () => {
    if (cameraSupported) {
      startCamera();
    } else {
      handleFileUpload();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">写真眼鏡</h1>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
      <div className="max-w-md mx-auto h-screen flex flex-col">
        
        {!isCapturing && !capturedImage && (
          // 主页状态
          <>
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
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center">
                {/* 卡通放大镜拍照按钮 */}
                <div className="relative mx-auto w-80 h-80 mb-12">
                  <button onClick={handleMainCameraButton} className="block w-full h-full">
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
                  </button>
                </div>

                {/* 说明文字 */}
                <div className="space-y-4">
                  <p className="text-xl font-bold text-gray-700">
                    📸 写真を撮影してください
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {cameraSupported ? (
                      <>カメラで撮影するか<br/>ファイルを選択してください</>
                    ) : (
                      <>ファイルを選択して<br/>画像をアップロードしてください</>
                    )}
                  </p>
                </div>

                {/* 备用按钮 */}
                <div className="mt-8 space-y-4">
                  {cameraSupported && (
                    <button
                      onClick={handleFileUpload}
                      className="w-full bg-blue-500 text-white py-3 px-6 rounded-full font-bold hover:bg-blue-600 transition-colors"
                    >
                      📁 ファイルから選択
                    </button>
                  )}
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
          </>
        )}

        {isCapturing && (
          // 拍照状态
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl bg-black mx-4 my-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* 拍照框架装饰 */}
                <div className="absolute inset-4 border-4 border-white border-dashed rounded-xl opacity-50"></div>
                
                {/* 拍照提示 */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                  📝 文字がはっきり見えるように撮影してください
                </div>
              </div>
            </div>

            {/* 拍照按钮 */}
            <div className="flex justify-center pb-8 space-x-4">
              <button
                onClick={stopCamera}
                className="bg-gray-500 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-600 transition-colors"
              >
                ❌ キャンセル
              </button>
              
              <button
                onClick={capturePhoto}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                📸 撮影
              </button>
            </div>
          </div>
        )}

        {capturedImage && (
          // 结果显示状态
          <div className="flex-1 flex flex-col p-4 space-y-6 overflow-y-auto">
            {/* 拍摄的照片 */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={capturedImage}
                alt="撮影した写真"
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                ✅ 撮影完了
              </div>
            </div>

            {/* AI分析状态 */}
            {isAnalyzing && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-blue-700 font-bold text-lg">🤖 AI分析中...</p>
                <p className="text-blue-600 text-sm mt-2">内容を読み取っています</p>
              </div>
            )}

            {/* 识别结果 */}
            {recognizedText && !isAnalyzing && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <h3 className="text-green-800 font-bold text-lg mb-4 flex items-center">
                  🔍 認識結果
                </h3>
                <div className="bg-white rounded-xl p-4 border-2 border-green-200 mb-4">
                  <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {recognizedText}
                  </p>
                </div>
                
                {recognizedText !== '内容を認識できませんでした' && (
                  <button
                    onClick={speakText}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-4"
                  >
                    <span>🔊</span>
                    <span>音声で読み上げ</span>
                  </button>
                )}
              </div>
            )}

            {/* 错误显示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-700 font-bold">❌ エラー</p>
                <p className="text-red-600 text-sm mt-2">{error}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex space-x-4 pb-4">
              <button
                onClick={retakePhoto}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                📷 もう一度撮影
              </button>
            </div>
          </div>
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 隐藏的canvas用于图片处理 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
} 