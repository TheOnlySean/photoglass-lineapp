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
  const [isInLiffClient, setIsInLiffClient] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeLiff();
        
        if (typeof window !== 'undefined' && (window as any).liff) {
          const inLiff = (window as any).liff.isInClient();
          setIsInLiffClient(inLiff);
          console.log('LIFF Environment detected:', inLiff);
        }
        
        if (!isInLiffClient && typeof navigator !== 'undefined' && 
            navigator.mediaDevices && 
            typeof navigator.mediaDevices.getUserMedia === 'function') {
          setCameraSupported(true);
          console.log('Camera getUserMedia is supported');
        } else {
          console.log('Using file-based camera approach for LIFF environment');
          setCameraSupported(false);
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

  const startCameraCapture = useCallback(() => {
    console.log('📱 Starting camera capture...');
    console.log('Environment - LIFF:', isInLiffClient, 'Camera supported:', cameraSupported);
    
    if (isInLiffClient) {
      console.log('📱 Using LIFF camera file input');
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    } else if (cameraSupported) {
      console.log('📱 Attempting getUserMedia in external browser');
      startCameraStream();
    } else {
      console.log('📱 Falling back to file input');
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  }, [isInLiffClient, cameraSupported]);

  const startCameraStream = useCallback(async () => {
    try {
      setError('');
      console.log('🎥 Starting camera stream...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('このブラウザはカメラ機能をサポートしていません');
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      console.log('🎥 Requesting camera permission...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('🎥 Camera stream obtained successfully');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
        console.log('🎥 Camera preview started');
      }
    } catch (err) {
      console.error('🎥 Camera stream error:', err);
      
      let errorMsg = 'カメラへのアクセスに失敗しました。';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMsg = 'カメラの使用が許可されていません。ブラウザの設定を確認してください。';
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'カメラが見つかりません。';
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'カメラが他のアプリケーションによって使用されています。';
        }
      }
      
      setError(errorMsg + ' ファイル選択をご利用ください。');
      
      setTimeout(() => {
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
      }, 2000);
    }
  }, []);

  const handleCameraFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      console.log('📱 Camera file selected:', file.name, file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);
        console.log('📱 Image loaded successfully');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileUpload = useCallback(() => {
    console.log('📁 User chose file upload from gallery');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      console.log('📁 Gallery file selected:', file.name, file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
  }, [stopCamera]);

  const analyzeImage = async (imageDataUrl: string) => {
    setRecognizedText('');
    setError('');
    setIsAnalyzing(true);
    
    const requestId = Date.now().toString();
    console.log(`Starting AI analysis - Request ID: ${requestId}`);
    
    // 画像サイズの正確なチェック
    const commaIndex = imageDataUrl.indexOf(',');
    const base64Data = imageDataUrl.substring(commaIndex + 1);
    const actualBytes = (base64Data.length * 3) / 4; // Base64 -> bytes正確な計算
    const actualMB = actualBytes / (1024 * 1024);
    const maxSizeMB = 25; // 25MB制限（iPhone写真対応）
    
    console.log(`Actual image size: ${actualMB.toFixed(2)}MB`);
    
    if (actualBytes > maxSizeMB * 1024 * 1024) {
      console.log(`Image too large: ${actualMB.toFixed(2)}MB`);
      setError(`画像サイズが大きすぎます（${actualMB.toFixed(2)}MB）。25MB以下の画像をご利用ください。`);
      setIsAnalyzing(false);
      return;
    }
    
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl,
          requestId: requestId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 特定のエラーに対してより詳細なメッセージを提供
        if (response.status === 408) {
          throw new Error('分析がタイムアウトしました。画像サイズを小さくして再試行してください。');
        } else if (response.status === 413) {
          throw new Error('画像サイズが大きすぎます。25MB以下の画像をご利用ください。');
        } else if (response.status === 429) {
          throw new Error('一時的に利用が集中しています。少し待ってから再試行してください。');
        }
        
        throw new Error(errorData.error || 'AI分析に失敗しました');
      }

      const result = await response.json();
      console.log(`AI analysis completed - Request ID: ${requestId}`, result);
      
      const analyzedText = result.text || '内容を認識できませんでした';
      setRecognizedText(analyzedText);
      
      if (autoSpeakEnabled && analyzedText && analyzedText !== '内容を認識できませんでした') {
        setTimeout(() => {
          setIsLoadingAudio(true);
          speakText(analyzedText);
        }, 1000);
      }
      
    } catch (err) {
      console.error(`AI analysis error - Request ID: ${requestId}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'AI分析中にエラーが発生しました。もう一度お試しください。';
      setError(errorMessage);
      setRecognizedText('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speakText = async (textToSpeak?: string) => {
    const textContent = textToSpeak || recognizedText;
    if (!textContent || textContent === '内容を認識できませんでした' || isSpeaking) return;
    
    if (!isLoadingAudio) {
      setIsLoadingAudio(true);
    }
    setIsSpeaking(true);
    
    try {
      console.log('Starting TTS with Google Cloud...');
      
      const response = await fetch('/api/google-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textContent
        }),
      });

      if (!response.ok) {
        throw new Error('音声合成に失敗しました');
      }

      const result = await response.json();
      
      const audioBytes = atob(result.audioContent);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          setIsLoadingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setIsSpeaking(false);
          setIsLoadingAudio(false);
          URL.revokeObjectURL(audioUrl);
          console.error('Audio playback failed');
          fallbackToWebTTS(textContent);
        };
        
        await audioRef.current.play();
        console.log('Google TTS audio started playing');
        setIsLoadingAudio(false);
      }
      
    } catch (err) {
      console.error('Google TTS error:', err);
      setIsSpeaking(false);
      setIsLoadingAudio(false);
      fallbackToWebTTS(textContent);
    }
  };

  const fallbackToWebTTS = (textToSpeak?: string) => {
    const textContent = textToSpeak || recognizedText;
    console.log('Falling back to browser TTS...');
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsLoadingAudio(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsLoadingAudio(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsLoadingAudio(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  };

  const toggleAutoSpeak = () => {
    const newState = !autoSpeakEnabled;
    setAutoSpeakEnabled(newState);
    
    if (!newState && (isSpeaking || isLoadingAudio)) {
      stopSpeaking();
    }
  };

  const retakePhoto = () => {
    console.log('Retaking photo - clearing all states');
    setCapturedImage(null);
    setRecognizedText('');
    setError('');
    setIsAnalyzing(false);
    setIsSpeaking(false);
    setIsLoadingAudio(false);
    
    stopSpeaking();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 overflow-x-hidden">
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col">
        
        {!isCapturing && !capturedImage && (
          <div className="flex-1">
            {/* 头部 */}
            <div className="text-center pt-12 pb-8">
              <h1 className="text-4xl font-black text-gray-800 mb-4" style={{fontFamily: '"Comic Sans MS", "Hiragino Maru Gothic Pro", "Yu Gothic UI", cursive, sans-serif'}}>写真眼鏡</h1>
              {isInLiffClient && (
                <p className="text-sm text-blue-600 mt-2 bg-blue-50 px-3 py-1 rounded-full inline-block">
                  📱 LINE環境で実行中
                </p>
              )}
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mx-4 mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* 主要拍照区域 */}
            <div className="flex items-center justify-center px-4 py-8 flex-1">
              <div className="text-center w-full">
                {/* 主拍照按钮 - 精美设计版本 */}
                <div className="relative mx-auto w-80 h-80 mb-8">
                  {/* 外层装饰圆环 */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-spin-slow opacity-20"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-l from-blue-400 via-purple-400 to-pink-400 animate-spin-reverse opacity-30"></div>
                  
                  {/* 主按钮 */}
                  <div className="absolute inset-4">
                    <button 
                      onClick={startCameraCapture}
                      className="w-full h-full bg-gradient-to-br from-red-500 via-pink-500 to-red-600 rounded-full text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                      style={{fontFamily: '"Comic Sans MS", "Hiragino Maru Gothic Pro", "Yu Gothic UI", cursive, sans-serif'}}
                      type="button"
                    >
                      {/* 呼吸动画背景 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-400 rounded-full animate-pulse opacity-50"></div>
                      
                      {/* 放大镜造型 */}
                      <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        {/* 放大镜设计 */}
                        <div className="relative mb-4">
                          {/* 放大镜镜片 - 圆形边框 */}
                          <div className="w-20 h-20 border-6 border-white rounded-full bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center">
                            {/* 放大镜内的加号或圆点 */}
                            <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
                          </div>
                          {/* 放大镜手柄 */}
                          <div className="absolute -bottom-4 -right-4 w-6 h-10 bg-white rounded-full transform rotate-45 shadow-lg"></div>
                        </div>
                        
                        {/* 主要文字 */}
                        <div className="text-4xl font-black text-white drop-shadow-lg">
                          押
                        </div>
                      </div>
                      
                      {/* 内层装饰光环 */}
                      <div className="absolute inset-6 border-4 border-white border-opacity-30 rounded-full animate-ping"></div>
                      <div className="absolute inset-8 border-2 border-white border-opacity-20 rounded-full group-hover:animate-spin"></div>
                      
                      {/* 悬浮时的光效 */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                  </div>
                  
                  {/* 周围的装饰元素 */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
                  <div className="absolute -top-2 -right-6 w-6 h-6 bg-blue-400 rounded-full animate-bounce delay-300 opacity-80"></div>
                  <div className="absolute -bottom-4 -left-6 w-7 h-7 bg-green-400 rounded-full animate-bounce delay-500 opacity-80"></div>
                  <div className="absolute -bottom-2 -right-4 w-5 h-5 bg-purple-400 rounded-full animate-bounce delay-700 opacity-80"></div>
                  
                  {/* 文字装饰 */}
                  <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-12">
                    <span className="text-2xl">📸</span>
                  </div>
                  <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 rotate-12">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>

                {/* 说明文字 */}
                <div className="space-y-6">
                  <p className="text-3xl font-bold text-gray-700 mb-6 animate-bounce" style={{fontFamily: '"Comic Sans MS", "Hiragino Maru Gothic Pro", "Yu Gothic UI", cursive, sans-serif'}}>
                    <span className="inline-block animate-pulse bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                      📸 タップして撮影
                    </span>
                  </p>
                </div>

                {/* 文件上传按钮 */}
                <div className="mt-8">
                  <button
                    onClick={handleFileUpload}
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white py-4 px-6 rounded-full font-bold hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 transition-all duration-300 text-xl shadow-xl transform hover:scale-105 hover:shadow-2xl relative overflow-hidden group"
                    type="button"
                  >
                    {/* 按钮内的光效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                      <span className="text-2xl">📁</span>
                      <span>アルバムから選択</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 底部功能链接 */}
            <div className="px-4 pb-4">
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  📖 このアプリについて
                </h3>
                <div className="space-y-3 text-base text-gray-700">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🔍</span>
                    <span>見えにくい文字を読み上げます</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🤖</span>
                    <span>見た内容を詳しく説明します</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🔊</span>
                    <span>音声での読み上げ機能</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🌍</span>
                    <span>画像内の各言語を翻訳対応</span>
                  </div>
                  {isInLiffClient && (
                    <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-gray-200">
                      <span className="text-xl">📱</span>
                      <span className="text-blue-600 font-medium">LINE環境で最適化済み</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 法律文档链接 */}
            <div className="px-4 pb-4">
              <div className="flex justify-center space-x-6 text-xs">
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
        )}

        {isCapturing && (
          // 拍照状态（仅用于getUserMedia流）
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl bg-black mx-4 my-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-4 border-4 border-white border-dashed rounded-xl opacity-50"></div>
                
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                  📝 文字がはっきり見えるように撮影してください
                </div>
              </div>
            </div>

            <div className="flex justify-center pb-8 space-x-4">
              <button
                onClick={stopCamera}
                className="bg-gray-500 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-600 transition-colors"
                type="button"
              >
                ❌ キャンセル
              </button>
              
              <button
                onClick={capturePhoto}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                type="button"
              >
                📸 撮影
              </button>
            </div>
          </div>
        )}

        {capturedImage && (
          // 结果显示状态
          <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
            {/* 固定头部 */}
            <div className="flex-shrink-0 text-center pt-6 pb-4 bg-white shadow-sm relative">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">🔍 AI解析結果</h2>
              <p className="text-gray-600 text-lg">内容をわかりやすく説明します</p>
              
              {/* 圆形声音开关按钮 */}
              <button
                onClick={toggleAutoSpeak}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all duration-200 transform hover:scale-110 ${
                  autoSpeakEnabled 
                    ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                } ${(isSpeaking || isLoadingAudio) ? 'animate-pulse' : ''}`}
                type="button"
                title={autoSpeakEnabled ? '音声オン（クリックでオフ）' : '音声オフ（クリックでオン）'}
              >
                {autoSpeakEnabled ? (isSpeaking || isLoadingAudio ? '🔊' : '🔊') : '🔇'}
              </button>
            </div>

            {/* 可滚动的主内容区域 */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* 拍摄的照片缩略图 */}
              <div className="mb-6">
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-white p-2">
                  <img
                    src={capturedImage}
                    alt="撮影した写真"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    ✅ 完了
                  </div>
                </div>
              </div>

              {/* AI分析状态 */}
              {isAnalyzing && (
                <div className="mb-6">
                  <div className="bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-blue-200">
                    <div className="relative mb-6">
                      <div className="animate-spin w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
                        🤖
                      </div>
                    </div>
                    <p className="text-blue-700 font-bold text-2xl mb-3">AI解析中</p>
                    <p className="text-blue-600 text-lg">しばらくお待ちください...</p>
                    <div className="mt-6 flex justify-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 音频加载提示 */}
              {isLoadingAudio && (
                <div className="mb-6">
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 text-center">
                    <div className="relative mb-4">
                      <div className="animate-spin w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full mx-auto"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
                        🔊
                      </div>
                    </div>
                    <p className="text-orange-700 font-bold text-xl mb-2">音声を準備中</p>
                    <p className="text-orange-600 text-lg">しばらくお待ちください...</p>
                  </div>
                </div>
              )}

              {/* AI解析结果 */}
              {recognizedText && !isAnalyzing && (
                <div className="mb-6">
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 px-6 py-4 border-b border-green-200">
                      <h3 className="text-green-800 font-bold text-xl flex items-center justify-center">
                        <span className="text-2xl mr-3">📝</span>
                        解析結果
                      </h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <p className="text-gray-800 text-2xl leading-relaxed font-medium whitespace-pre-wrap tracking-wide">
                          {recognizedText}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 错误显示 */}
              {error && (
                <div className="mb-6">
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-6 text-center">
                    <div className="text-5xl mb-4">❌</div>
                    <p className="text-red-700 font-bold text-xl mb-3">エラーが発生しました</p>
                    <p className="text-red-600 text-lg leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* AI解读按钮 */}
              {!recognizedText && !isAnalyzing && !error && (
                <div className="mb-6">
                  <button
                    onClick={() => analyzeImage(capturedImage)}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6 rounded-2xl font-bold text-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    type="button"
                  >
                    <span className="text-3xl">🤖</span>
                    <span>AI解読を開始</span>
                  </button>
                </div>
              )}

              <div className="h-32"></div>
            </div>

            {/* 固定底部按钮区域 */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4">
              <div className="flex space-x-3">
                {recognizedText && !isAnalyzing && recognizedText !== '内容を認識できませんでした' && (
                  <button
                    onClick={() => speakText(recognizedText)}
                    disabled={isSpeaking}
                    className={`flex-1 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isSpeaking 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed' 
                        : 'bg-gradient-to-r from-orange-400 to-red-400 text-white'
                    }`}
                    type="button"
                  >
                    <span className="text-2xl">🔊</span>
                    <span>再聞</span>
                  </button>
                )}

                {recognizedText && !isAnalyzing && recognizedText !== '内容を認識できませんでした' && (
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: '🔍 写真眼鏡 - AI画像解読アプリ',
                          text: `📸 写真を撮るだけで
🤖 AIが内容を音声で読み上げ
🌍 各言語の翻訳にも対応
👴 高齢者にもやさしい設計

見えにくい文字でお困りの方におすすめです！`,
                          url: window.location.origin
                        });
                      } else {
                        // fallback for browsers that don't support Web Share API
                        const shareText = `🔍 写真眼鏡 - AI画像解読アプリ

📸 写真を撮るだけで
🤖 AIが内容を音声で読み上げ  
🌍 各言語の翻訳にも対応
👴 高齢者にもやさしい設計

見えにくい文字でお困りの方におすすめです！

${window.location.origin}`;
                        
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(shareText);
                          alert('アプリの紹介文をコピーしました！');
                        }
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-green-400 to-blue-400 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                    type="button"
                  >
                    <span className="text-2xl">👥</span>
                    <span>友達に紹介</span>
                  </button>
                )}

                <button
                  onClick={retakePhoto}
                  className="flex-1 bg-gradient-to-r from-red-400 to-pink-400 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  type="button"
                >
                  <span className="text-2xl">📷</span>
                  <span>再撮影</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 隐藏的文件输入 - 用于相册选择 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 隐藏的相机文件输入 - 专用于相机拍照 */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraFileChange}
          className="hidden"
        />

        <audio ref={audioRef} className="hidden" preload="none" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
} 