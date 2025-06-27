import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, prompt } = body;

    if (!image) {
      return NextResponse.json(
        { error: '画像データが提供されていません' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API キーが設定されていません' },
        { status: 500 }
      );
    }

    // OpenAI Vision API を呼び出し
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Vision対応モデル
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt || "画像内のすべての文字を正確に読み取って、日本語で返してください。文字が見つからない場合は「文字が検出されませんでした」と返してください。文字の配置や改行も可能な限り保持してください。"
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high" // 高解像度で分析
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1, // 一貫性を重視
    });

    const recognizedText = response.choices[0]?.message?.content || '文字が検出されませんでした';

    return NextResponse.json({
      text: recognizedText,
      success: true
    });

  } catch (error) {
    console.error('OpenAI API エラー:', error);
    
    if (error instanceof Error) {
      // API制限やその他のエラーを適切に処理
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'API使用制限に達しました。しばらく待ってからもう一度お試しください。' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json(
          { error: 'API使用量が上限に達しました。' },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      { error: 'AI分析中にエラーが発生しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
} 