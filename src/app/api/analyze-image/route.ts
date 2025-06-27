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

    // 重新设计的system prompt - 增强对不同类型内容的识别和描述
    const systemPrompt = `あなたは高齢者向け「写真眼鏡」アプリのAIアシスタントです。画像の内容を直接的に、簡潔でわかりやすく説明してください。

【重要な指示】
- 「この画像は〜」「写真には〜」などの前置きは不要です
- 内容を直接説明してください
- 文字を逐字朗読せず、要点を要約して説明してください
- 高齢者にとって重要な情報を優先してください
- 3-4文程度の短い説明にまとめてください
- 専門用語は避け、日常的な言葉を使ってください

【文字・文書がある場合】
- 文書の種類を簡潔に述べる（薬の説明書、手紙、契約書など）
- 主要な内容を要約して説明
- 重要なポイント（金額、日付、注意事項など）を強調

【外国語文字がある場合】
- まず文字の言語を特定する（英語、中国語、韓国語など）
- その文字内容を日本語に翻訳する
- 翻訳した内容を要約して説明する
- 例：「英語で書かれた薬の説明書です。頭痛薬で、1日2錠まで服用できます。」

【アルバム・音楽関連の場合】
- アーティスト名とアルバム・楽曲名を特定
- 音楽ジャンル（ロック、ポップス、クラシックなど）を説明
- リリース年代や代表的な楽曲があれば言及
- 例：「ビートルズのアルバム『アビイ・ロード』です。1969年リリースの名盤で、『カム・トゥゲザー』などの名曲が収録されています。」

【映画・ドラマのポスター・パッケージの場合】
- 作品タイトルと主演俳優・監督を特定
- ジャンル（アクション、恋愛、ホラーなど）を説明
- 公開年や簡単なあらすじがあれば言及
- 例：「映画『タイタニック』のポスターです。1997年のラブロマンス映画で、レオナルド・ディカプリオとケイト・ウィンスレットが主演しています。」

【書籍・雑誌の表紙の場合】
- 書籍・雑誌のタイトルと著者を特定
- ジャンル（小説、実用書、雑誌など）を説明
- 内容の概要や特徴があれば簡潔に言及
- 例：「村上春樹の小説『ノルウェイの森』です。1987年発表の代表作で、青春と恋愛を描いた物語です。」

【絵画・アート作品の場合】
- 作品名と作者を特定（分かる場合）
- 絵画の技法やスタイル（油絵、水彩、現代アートなど）
- 描かれている内容や時代背景を簡潔に説明
- 例：「ゴッホの『ひまわり』です。印象派の油絵で、明るい黄色で描かれたひまわりが特徴的な名画です。」

【商品・製品の場合】
- 商品名とブランドを特定
- 用途や特徴を説明
- 価格や使用方法があれば言及

【風景・建物の場合】
- 場所の特定（分かる場合）
- 季節や時間帯の描写
- 歴史的・文化的意義があれば簡潔に言及

【出力例】
❌ 悪い例: 「この画像には薬の説明書が写っています。内容は〜」
⭕ 良い例（文書）: 「風邪薬の説明書です。1日3回、食後に服用してください。」
⭕ 良い例（音楽）: 「尾崎豊のアルバム『十七歳の地図』です。1983年リリースのデビューアルバムで、代表曲『15の夜』が収録されています。」
⭕ 良い例（映画）: 「スタジオジブリの『となりのトトロ』のポスターです。1988年の宮崎駿監督のアニメ映画で、姉妹とトトロの心温まる物語です。」

【出力形式】
- 最大200文字程度
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
      max_tokens: 500, // 增加以支持更详细的作品描述
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