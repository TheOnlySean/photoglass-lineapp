import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 只在运行时初始化OpenAI客户端，避免构建时错误
let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function POST(request: NextRequest) {
  let body: any = {};
  let requestId = 'unknown';
  
  try {
    body = await request.json();
    requestId = body.requestId || 'unknown';
    const { image, prompt } = body;

    // 日志记录请求
    console.log(`[${requestId || 'unknown'}] Starting image analysis`);

    if (!image) {
      console.log(`[${requestId}] Error: No image data provided`);
      return NextResponse.json(
        { error: '画像データが提供されていません' },
        { status: 400 }
      );
    }

    // 画像サイズチェック（Base64文字列の長さで概算）
    const imageSizeEstimate = image.length * 0.75; // Base64 -> bytes概算
    const maxSizeMB = 25; // 25MB制限（iPhone写真対応）
    if (imageSizeEstimate > maxSizeMB * 1024 * 1024) {
      console.log(`[${requestId}] Error: Image too large (${(imageSizeEstimate / 1024 / 1024).toFixed(2)}MB)`);
      return NextResponse.json(
        { error: '画像サイズが大きすぎます。25MB以下の画像をご利用ください。', requestId },
        { status: 413 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log(`[${requestId || 'unknown'}] Error: No OpenAI API key`);
      return NextResponse.json(
        { error: 'OpenAI API キーが設定されていません' },
        { status: 500 }
      );
    }

    // 重新设计的system prompt - 增强对不同类型内容的识别和描述
    const systemPrompt = `あなたは高齢者向け「写真眼鏡」アプリのAIアシスタントです。画像の内容を直接的に、簡潔でわかりやすく説明してください。

【最優先：文字・文書の解説】
画像に文字や説明文がある場合は、必ずこれを最優先で処理してください：
- 主要な内容を説明
- 重要なポイント（金額、日付、注意事項、使用方法など）を強調
- 例：「風邪薬の説明書です。1日3回、食後に服用してください。副作用として眠気があります。」

【外国語文字の処理】
- まず文字の言語を特定する（英語、中国語、韓国語など）
- その文字内容を日本語に翻訳する
- 翻訳した内容を要約して説明する
- 例：「英語で書かれた薬の説明書です。頭痛薬で、1日2錠まで服用できます。」

【芸術作品・エンターテイメント作品の場合】
音楽アルバム、映画、書籍、絵画などの芸術作品の場合：
- 作品名と作者・アーティスト・監督を特定
- ジャンルや分野を説明
- 創作年代や背景となる物語があれば簡潔に言及
- 作品の特徴やスタイルを説明
- 例：「ビートルズのアルバム『アビイ・ロード』です。1969年リリースの名盤で、ロックの代表作です。」

【商品・その他の場合】
- 商品名とブランドを特定
- 用途や特徴を説明
- 価格や使用方法があれば言及

【重要な指示】
- 「この画像は〜」「写真には〜」などの前置きは不要です
- 内容を直接説明してください
- 要点を要約して説明してください
- 高齢者にとって重要な情報を優先してください
- 3-4文程度の短い説明にまとめてください
- 専門用語は避け、日常的な言葉を使ってください
- 最大200文字程度で親しみやすく丁寧な口調で`;

    // 简化的user prompt - 更直接的指示，包含翻译功能
    const userPrompt = prompt || `内容を直接的に説明してください。前置きは不要です。日本語の文字がある場合は要点を要約し、外国語の文字がある場合は日本語に翻訳して要約し、文字がない場合は写っているものを説明してください。`;

    console.log(`[${requestId || 'unknown'}] Calling OpenAI API`);

    // OpenAI クライアントを取得
    const client = getOpenAIClient();
    if (!client) {
      console.log(`[${requestId || 'unknown'}] Error: OpenAI client not available`);
      return NextResponse.json(
        { error: 'OpenAI API キーが設定されていません' },
        { status: 500 }
      );
    }

    // OpenAI Vision API を呼び出し（最適化版）
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // 高速なminiモデル
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "low" // 速度優先
              }
            }
          ]
        }
      ],
      max_tokens: 500, // 增加以支持更详细的作品描述
      temperature: 0.1
    }, {
      // タイムアウト設定を延長（複雑な画像対応）
      timeout: 45000 // 45秒タイムアウト
    });

    const recognizedText = response.choices[0]?.message?.content || '内容を認識できませんでした';

    console.log(`[${requestId || 'unknown'}] Analysis completed successfully`);

    return NextResponse.json({
      text: recognizedText,
      success: true,
      requestId: requestId,
      model: "gpt-4o-mini",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[${requestId}] OpenAI API エラー:`, error);
    
    if (error instanceof Error) {
      // タイムアウトエラー
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        console.log(`[${requestId}] Timeout error`);
        return NextResponse.json(
          { error: '分析がタイムアウトしました。画像サイズを小さくして再試行してください。', requestId },
          { status: 408 }
        );
      }
      
      // API制限エラー
      if (error.message.includes('rate_limit')) {
        console.log(`[${requestId}] Rate limit error`);
        return NextResponse.json(
          { error: 'API使用制限に達しました。しばらく待ってからもう一度お試しください。', requestId },
          { status: 429 }
        );
      }
      
      // クォータエラー
      if (error.message.includes('insufficient_quota')) {
        console.log(`[${requestId}] Quota error`);
        return NextResponse.json(
          { error: 'API使用量が上限に達しました。', requestId },
          { status: 402 }
        );
      }

      // その他のエラー
      console.log(`[${requestId}] Other error: ${error.message}`);
    }

    return NextResponse.json(
      { error: 'AI分析中にエラーが発生しました。もう一度お試しください。', requestId },
      { status: 500 }
    );
  }
} 