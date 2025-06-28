import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // 检查必要的环境变量
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_PROJECT_ID) {
      console.error('Missing Google Cloud TTS environment variables');
      return NextResponse.json(
        { error: 'Google TTS service not configured' },
        { status: 500 }
      );
    }

    // 构建Google Cloud TTS API请求
    const credential = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // 获取访问令牌
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      credentials: credential,
      projectId: process.env.GOOGLE_PROJECT_ID,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    // 调用Google Cloud TTS API
    const ttsResponse = await fetch(
      'https://texttospeech.googleapis.com/v1/text:synthesize',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'ja-JP',
            name: 'ja-JP-Neural2-B', // 女性日语声音
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.1, // 稍快一点，更自然
            pitch: 0.0,
            volumeGainDb: 0.0
          }
        })
      }
    );

    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      console.error('Google TTS API error:', error);
      return NextResponse.json(
        { error: 'TTS service error' },
        { status: 500 }
      );
    }

    const ttsData = await ttsResponse.json();
    
    return NextResponse.json({
      audioContent: ttsData.audioContent
    });

  } catch (error) {
    console.error('Google TTS error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 