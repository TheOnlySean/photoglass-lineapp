import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, requestId, prompt } = body;

    // 日志记录请求
    console.log(`[${requestId || 'unknown'}] Starting image analysis`);

    if (!image) {
      console.log(`[${requestId || 'unknown'}] Error: No image data provided`);
      return NextResponse.json(
        { error: '画像データが提供されていません' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log(`[${requestId || 'unknown'}] Error: No OpenAI API key`);
      return NextResponse.json(
        { error: 'OpenAI API キーが設定されていません' },
        { status: 500 }
      );
    }

    // 重新设计的system prompt - 专注于总结和简洁，直接描述内容，支持多语言翻译
    const systemPrompt = `あなたは高齢者向け「写真眼鏡」アプリのAIアシスタントです。画像の内容を直接的に、簡潔でわかりやすく説明してください。

【重要な指示】
- 「この画像は〜」「写真には〜」などの前置きは不要です
- 内容を直接説明してください
- 文字を逐字朗読せず、要点を要約して説明してください
- 高齢者にとって重要な情報を優先してください
- 3-4文程度の短い説明にまとめてください
- 専門用語は避け、日常的な言葉を使ってください

【日本語文字がある場合】
- 文書の種類を簡潔に述べる（薬の説明書、手紙、契約書など）
- 主要な内容を要約して説明
- 重要なポイント（金額、日付、注意事項など）を強調

【外国語文字がある場合】
- まず文字の言語を特定する（英語、中国語、韓国語など）
- その文字内容を日本語に翻訳する
- 翻訳した内容を要約して説明する
- 例：「英語で書かれた薬の説明書です。頭痛薬で、1日2錠まで服用できます。」

【文字がない場合】
- 写っているものを直接説明
- 色、形、状況を含めて描写
- 必要に応じて簡単な背景知識を追加

【出力例】
❌ 悪い例: 「この画像には薬の説明書が写っています。内容は〜」
⭕ 良い例（日本語）: 「風邪薬の説明書です。1日3回、食後に服用してください。」
⭕ 良い例（外国語）: 「英語で書かれたレストランのメニューです。ハンバーガーセットが15ドル、ピザが20ドルです。」

【出力形式】
- 最大150文字程度
- 親しみやすく丁寧な口調
- 箇条書きではなく自然な文章で`;

    // 简化的user prompt - 更直接的指示，包含翻译功能
    const userPrompt = prompt || `内容を直接的に説明してください。前置きは不要です。日本語の文字がある場合は要点を要約し、外国語の文字がある場合は日本語に翻訳して要約し、文字がない場合は写っているものを説明してください。`;

    console.log(`[${requestId || 'unknown'}] Calling OpenAI API`);

    // OpenAI Vision API を呼び出し（最適化版）
    const response = await openai.chat.completions.create({
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
      max_tokens: 400, // さらに削減して簡潔な回答に
      temperature: 0.1
    }, {
      // タイムアウト設定
      timeout: 25000 // 25秒タイムアウト
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
    const requestId = 'unknown'; // エラー時はunknownとして処理
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