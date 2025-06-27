import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'alloy', language = 'ja' } = body;

    console.log('TTS request:', { textLength: text?.length, voice, language });

    if (!text) {
      return NextResponse.json(
        { error: 'テキストが提供されていません' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API キーが設定されていません' },
        { status: 500 }
      );
    }

    // OpenAI TTS API を呼び出し
    console.log('Calling OpenAI TTS API...');
    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // 高速版本，适合实时应用
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      response_format: 'mp3',
      speed: 0.9 // 稍微慢一点，适合高龄用户
    });

    console.log('TTS generation completed');

    // 将音频数据转换为Buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // 返回音频数据
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('OpenAI TTS API エラー:', error);
    
    if (error instanceof Error) {
      // API制限エラー
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'TTS API使用制限に達しました。しばらく待ってからもう一度お試しください。' },
          { status: 429 }
        );
      }
      
      // クォータエラー
      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json(
          { error: 'TTS API使用量が上限に達しました。' },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      { error: '音声合成中にエラーが発生しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
} 