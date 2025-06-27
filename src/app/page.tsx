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
  const [isLoadingAudio, setIsLoadingAudio] = useState(false); // 音频加载状态
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true); // 默认开启自动朗读
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeLiff();
        
        // 检查是否在LIFF客户端中
        if (typeof window !== 'undefined' && (window as any).liff) {
          setIsInLiffClient((window as any).liff.isInClient());
        }
        
        // 检查相机支持
        if (typeof navigator !== 'undefined' && 
            navigator.mediaDevices && 
            typeof navigator.mediaDevices.getUserMedia === 'function') {
          setCameraSupported(true);
          console.log('Camera is supported');
        } else {
          console.log('Camera is not supported');
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

  // 启动相机（必须由用户交互触发）
  const startCamera = useCallback(async () => {
    try {
      setError('');
      console.log('🎥 Starting camera access...');
      console.log('Is in LIFF client:', isInLiffClient);
      console.log('Navigator.mediaDevices available:', !!navigator.mediaDevices);
      console.log('getUserMedia available:', !!navigator.mediaDevices?.getUserMedia);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('このブラウザはカメラ機能をサポートしていません');
      }

      // 在LIFF环境中，先尝试简单的约束
      const constraints = isInLiffClient ? {
        video: {
          facingMode: 'environment'
        },
        audio: false
      } : {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      console.log('🎥 Requesting camera permission with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('🎥 Camera stream obtained successfully:', stream);
      console.log('🎥 Video tracks:', stream.getVideoTracks());
      
      if (videoRef.current) {
        console.log('🎥 Setting video source...');
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
        console.log('🎥 Camera setup complete!');
      } else {
        console.error('🎥 Video ref is null!');
      }
    } catch (err) {
      console.error('🎥 Camera access error:', err);
      console.error('🎥 Error name:', err instanceof Error ? err.name : 'unknown');
      console.error('🎥 Error message:', err instanceof Error ? err.message : 'unknown');
      
      let errorMsg = 'カメラへのアクセスに失敗しました。';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMsg = 'カメラの使用が許可されていません。ブラウザの設定を確認してください。';
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'カメラが見つかりません。';
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'カメラが他のアプリケーションによって使用されています。';
        } else if (err.name === 'OverconstrainedError') {
          errorMsg = 'カメラの設定に問題があります。';
        } else if (err.name === 'NotSupportedError') {
          errorMsg = 'このブラウザまたは環境ではカメラがサポートされていません。';
        }
      }
      
      setError(errorMsg + ' 代わりにファイル選択をご利用ください。');
    }
  }, [isInLiffClient]);

  // 文件上传方式（备用方案）
  const handleFileUpload = useCallback(() => {
    console.log('User clicked file upload button');
    
    // 在LIFF环境中，优化文件选择体验
    if (isInLiffClient) {
      console.log('Opening file selector in LIFF environment');
      // 在LIFF中，直接使用文件输入，但设置为优先从相册选择
      if (fileInputRef.current) {
        // 确保文件输入配置正确
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.removeAttribute('capture'); // 移除capture属性，让用户可以选择相册
        fileInputRef.current.click();
      }
      return;
    }
    
    // 在外部浏览器中的备用方案
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isInLiffClient]);

  // 处理文件选择
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);
        // 不自动开始AI分析，等待用户点击按钮
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
    
    // 不自动开始AI分析，等待用户点击按钮
  }, [stopCamera]);

  // AI文字识别
  const analyzeImage = async (imageDataUrl: string) => {
    // 清理之前的状态，确保每次都是新的分析
    setRecognizedText('');
    setError('');
    setIsAnalyzing(true);
    
    // 生成请求唯一标识，防止重复请求
    const requestId = Date.now().toString();
    console.log(`Starting AI analysis - Request ID: ${requestId}`);
    
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl,
          requestId: requestId, // 添加请求ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'AI分析に失敗しました');
      }

      const result = await response.json();
      console.log(`AI analysis completed - Request ID: ${requestId}`, result);
      
      // 确保这是最新的请求结果
      const analyzedText = result.text || '内容を認識できませんでした';
      setRecognizedText(analyzedText);
      
      // AI解析完成后，如果开启自动朗读且有有效内容，则自动开始朗读
      if (autoSpeakEnabled && analyzedText && analyzedText !== '内容を認識できませんでした') {
        // 延迟一下让用户看到结果，然后显示音频加载提示并开始朗读
        setTimeout(() => {
          setIsLoadingAudio(true);
          speakText(analyzedText);
        }, 1000);
      }
      
    } catch (err) {
      console.error(`AI analysis error - Request ID: ${requestId}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'AI分析中にエラーが発生しました。もう一度お試しください。';
      setError(errorMessage);
      setRecognizedText(''); // 确保错误时清空之前的结果
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 高质量语音朗读 - 使用Google Cloud TTS
  const speakText = async (textToSpeak?: string) => {
    const textContent = textToSpeak || recognizedText;
    if (!textContent || textContent === '内容を認識できませんでした' || isSpeaking) return;
    
    // 如果还没有显示加载状态，则显示
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
      
      // Google TTS返回base64编码的音频数据
      const audioBytes = atob(result.audioContent);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // 播放音频
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
          // 降级到浏览器TTS
          fallbackToWebTTS(textContent);
        };
        
        await audioRef.current.play();
        console.log('Google TTS audio started playing');
        // 音频开始播放后，隐藏加载提示
        setIsLoadingAudio(false);
      }
      
    } catch (err) {
      console.error('Google TTS error:', err);
      setIsSpeaking(false);
      setIsLoadingAudio(false);
      // 降级到浏览器TTS
      fallbackToWebTTS(textContent);
    }
  };

  // 降级到浏览器TTS（备用方案）
  const fallbackToWebTTS = (textToSpeak?: string) => {
    const textContent = textToSpeak || recognizedText;
    console.log('Falling back to browser TTS...');
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1.1; // 稍微提高音调让声音更友好
      utterance.volume = 0.9;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsLoadingAudio(false); // 浏览器TTS开始时也要隐藏加载提示
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

  // 停止语音播放
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

  // 切换自动朗读开关
  const toggleAutoSpeak = () => {
    const newState = !autoSpeakEnabled;
    setAutoSpeakEnabled(newState);
    
    // 如果关闭自动朗读且当前正在播放或加载，则停止播放
    if (!newState && (isSpeaking || isLoadingAudio)) {
      stopSpeaking();
    }
  };

  // 重新拍照 - 完全重置所有状态
  const retakePhoto = () => {
    console.log('Retaking photo - clearing all states');
    setCapturedImage(null);
    setRecognizedText('');
    setError('');
    setIsAnalyzing(false);
    setIsSpeaking(false);
    setIsLoadingAudio(false);
    
    // 停止任何正在播放的音频
    stopSpeaking();
    
    // 清理文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 主拍照按钮处理（强制启动相机）
  const handleMainCameraButton = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('🔴 RED BUTTON CLICKED! - Starting camera...');
    console.log('Event target:', event.target);
    console.log('Event current target:', event.currentTarget);
    
    // 强制尝试启动相机，不依赖cameraSupported状态
    startCamera();
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
          // 主页状态 - 修复滚动问题
          <div className="flex-1">
            {/* 头部 */}
            <div className="text-center pt-12 pb-8">
              <h1 className="text-4xl font-black text-gray-800 mb-4" style={{fontFamily: '"Comic Sans MS", "Hiragino Maru Gothic Pro", "Yu Gothic UI", cursive, sans-serif'}}>写真眼鏡</h1>
              {isInLiffClient && (
                <p className="text-sm text-blue-600 mt-2">
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
                {/* 简化的红色拍照按钮 - 临时调试版本 */}
                <div className="mx-auto w-72 h-72 mb-8">
                  <button 
                    onClick={handleMainCameraButton}
                    className="w-full h-full bg-red-500 rounded-full text-white text-6xl font-bold shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
                    type="button"
                  >
                    📸<br/>押
                  </button>
                </div>

                {/* 说明文字 */}
                <div className="space-y-6">
                  <p className="text-3xl font-bold text-gray-700 mb-6 animate-bounce">
                    <span className="inline-block animate-pulse bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                      📸 タップして撮影
                    </span>
                  </p>
                </div>

                {/* 文件上传按钮 */}
                <div className="mt-8">
                  <button
                    onClick={handleFileUpload}
                    className="w-full bg-blue-500 text-white py-4 px-6 rounded-full font-bold hover:bg-blue-600 transition-colors text-lg shadow-lg"
                    type="button"
                  >
                    📁 ファイルから選択
                  </button>
                </div>

                {/* 调试用简单按钮 */}
                <div className="mt-4">
                  <button
                    onClick={() => {
                      console.log('🟢 SIMPLE TEST BUTTON CLICKED!');
                      alert('测试按钮被点击了！');
                      startCamera();
                    }}
                    className="w-full bg-green-500 text-white py-4 px-6 rounded-full font-bold hover:bg-green-600 transition-colors text-lg shadow-lg"
                    type="button"
                  >
                    🟢 测试相机按钮
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
          // 拍照状态
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
          // 结果显示状态 - 重新设计适合高龄用户
          <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
            {/* 固定头部 */}
            <div className="flex-shrink-0 text-center pt-6 pb-4 bg-white shadow-sm relative">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">🔍 AI解析結果</h2>
              <p className="text-gray-600 text-lg">内容をわかりやすく説明します</p>
              
              {/* 圆形声音开关按钮 - 放在右上角 */}
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

              {/* AI解析结果 - 大字体显示 */}
              {recognizedText && !isAnalyzing && (
                <div className="mb-6">
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden">
                    {/* 结果标题 */}
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 px-6 py-4 border-b border-green-200">
                      <h3 className="text-green-800 font-bold text-xl flex items-center justify-center">
                        <span className="text-2xl mr-3">📝</span>
                        解析結果
                      </h3>
                    </div>
                    
                    {/* 结果内容 - 特大字体适合高龄用户 */}
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

              {/* 如果没有结果且不在分析中，显示AI解读按钮 */}
              {!recognizedText && !isAnalyzing && !error && (
                <div className="mb-6">
                  <button
                    onClick={() => analyzeImage(capturedImage)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6 rounded-2xl font-bold text-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-4"
                    type="button"
                  >
                    <span className="text-3xl">🤖</span>
                    <span>AI解読を開始</span>
                  </button>
                </div>
              )}

              {/* 额外的底部间距，确保内容不会被底部按钮遮挡 */}
              <div className="h-32"></div>
            </div>

            {/* 固定底部按钮区域 */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4">
              <div className="flex space-x-3">
                {/* 重聽按钮 - 手动重新朗读 */}
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

                {/* 分享按钮 */}
                {recognizedText && !isAnalyzing && recognizedText !== '内容を認識できませんでした' && (
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: '写真眼鏡 - AI解析結果',
                          text: recognizedText
                        });
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-green-400 to-blue-400 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                    type="button"
                  >
                    <span className="text-2xl">📤</span>
                    <span>シェア</span>
                  </button>
                )}

                {/* 重拍按钮 */}
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

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 隐藏的audio元素用于TTS播放 */}
        <audio
          ref={audioRef}
          className="hidden"
          preload="none"
        />

        {/* 隐藏的canvas用于图片处理 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
} 