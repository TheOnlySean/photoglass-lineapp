'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

export default function CameraPage() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 启动相机
  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 后置摄像头
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      setError('カメラへのアクセスに失敗しました。ブラウザの設定でカメラの使用を許可してください。');
      console.error('Camera access error:', err);
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
      // 这里调用OpenAI Vision API进行文字识别
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl,
          prompt: '画像内のすべての文字を正確に読み取って、日本語で返してください。文字が見つからない場合は「文字が検出されませんでした」と返してください。'
        }),
      });

      if (!response.ok) {
        throw new Error('AI分析に失敗しました');
      }

      const result = await response.json();
      setRecognizedText(result.text || '文字が検出されませんでした');
    } catch (err) {
      setError('AI分析中にエラーが発生しました。もう一度お試しください。');
      console.error('AI analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 音声読み上げ
  const speakText = () => {
    if (!recognizedText || recognizedText === '文字が検出されませんでした') return;
    
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
    startCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <Link href="/" className="text-purple-600 hover:text-purple-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">📸 写真眼鏡</h1>
          <div className="w-6"></div>
        </div>

        {/* 主要内容区域 */}
        <div className="p-4">
          {!isCapturing && !capturedImage && (
            // 初始状态 - 卡通拍照按钮
            <div className="text-center py-12">
              <div className="relative mx-auto w-64 h-64 mb-8">
                {/* 卡通放大镜背景 */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-2xl transform rotate-12">
                  <div className="absolute inset-4 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-red-500">拍</span>
                  </div>
                  {/* 放大镜把手 */}
                  <div className="absolute -bottom-8 -right-8 w-16 h-24 bg-gradient-to-b from-red-400 to-red-600 rounded-full transform rotate-45 shadow-lg"></div>
                </div>
                
                {/* 装饰性元素 */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="absolute -top-2 -right-8 w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-8 w-10 h-10 bg-green-400 rounded-full animate-bounce delay-300"></div>
              </div>

              <button
                onClick={startCamera}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-pulse"
              >
                📷 カメラを起動
              </button>
              
              <p className="mt-6 text-gray-600 text-lg">
                小さな文字も大きく見える！<br/>
                📖 写真を撮って文字を読み上げ
              </p>
            </div>
          )}

          {isCapturing && (
            // 拍照状态
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-96 object-cover"
                />
                
                {/* 拍照框架装饰 */}
                <div className="absolute inset-4 border-4 border-white border-dashed rounded-xl opacity-50"></div>
                
                {/* 拍照提示 */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                  📝 文字がはっきり見えるように撮影してください
                </div>
              </div>

              {/* 拍照按钮 */}
              <div className="flex justify-center mt-8 space-x-4">
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
            <div className="space-y-6">
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
                  <p className="text-blue-600 text-sm mt-2">文字を読み取っています</p>
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
                  
                  {recognizedText !== '文字が検出されませんでした' && (
                    <button
                      onClick={speakText}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
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
              <div className="flex space-x-4">
                <button
                  onClick={retakePhoto}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
                >
                  📷 もう一度撮影
                </button>
                
                <Link
                  href="/"
                  className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold text-center hover:bg-gray-600 transition-colors"
                >
                  🏠 ホームに戻る
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 隐藏的canvas用于图片处理 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
} 