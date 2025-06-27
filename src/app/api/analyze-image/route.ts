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
          role: "system",
          content: `あなたは高齢者と視覚障害者向けの「写真眼鏡」アプリのAIアシスタントです。撮影された画像を分析して、以下の2つの状況に応じて適切に対応してください。

【状況1：画像に文字がある場合】
- 文字を正確に読み取り、高齢者が理解しやすい簡単な日本語で内容を説明してください
- 専門用語や難しい表現は、わかりやすい言葉に言い換えてください
- 文書の種類（薬の説明書、手紙、本、新聞など）を判断し、重要なポイントを整理して伝えてください
- 文字が小さくて読みにくい場合でも、できる限り正確に読み取ってください

【状況2：画像に文字がない、または文字が主体でない場合】
- 画像の内容を詳しく、わかりやすく描写してください
- 写っているものの名前、色、形、位置関係などを具体的に説明してください
- 発散的思考で背景知識を提供してください：

＊絵画の場合：作者、制作年代、作品の意味、技法、歴史的背景など
＊本の表紙の場合：著者、内容の概要、ジャンル、評価、関連作品など  
＊商品の場合：用途、特徴、使い方、注意点など
＊風景の場合：場所の特定、季節、時間帯、文化的意義など
＊人物の場合：服装、表情、状況、時代背景など
＊建物の場合：建築様式、歴史、用途、特徴など

【共通の注意事項】
- 常に高齢者・視覚障害者の立場に立って、親切で丁寧な説明を心がけてください
- 専門用語は避け、日常的でわかりやすい言葉を使ってください
- 情報が不確実な場合は「〜のようです」「〜と思われます」という表現を使ってください
- 相手の安全や健康に関わる情報（薬、食品、危険物など）は特に慎重に扱ってください`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt || `この画像を分析して、適切な支援を提供してください。

【分析手順】
1. まず画像に文字が含まれているかどうかを判断してください
2. 文字がある場合は、文字認識と内容理解の支援を行ってください
3. 文字がない場合は、画像の詳細な説明と背景知識の提供を行ってください

【文字がある場合の対応】
- すべての文字を正確に読み取ってください
- 内容を高齢者にわかりやすく説明してください
- 重要なポイントを整理して伝えてください
- 必要に応じて、専門用語を簡単な言葉で説明してください

【文字がない場合の対応】
- 画像に写っているものを詳しく説明してください
- 可能であれば、写っているものの背景知識や関連情報を提供してください
- 視覚障害者が画像の内容を理解できるように、具体的で分かりやすい説明をしてください

【重要】
- どちらの場合も、高齢者や視覚障害者の方が理解しやすい、親切で丁寧な説明を心がけてください
- 安全に関わる情報は特に注意深く扱ってください`
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
      max_tokens: 1500, // より長いテキストに対応
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