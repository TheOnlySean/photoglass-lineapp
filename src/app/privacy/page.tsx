import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            プライバシーポリシー
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              最終更新日：2025年6月27日
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. はじめに</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                株式会社PuzzleHunters（以下「当社」）は、「写真眼鏡」（以下「本アプリ」）をご利用いただくお客様のプライバシーを尊重し、個人情報の保護に努めています。本プライバシーポリシーは、本アプリにおける個人情報の取り扱いについて説明するものです。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. 収集する情報</h2>
              <h3 className="text-xl font-medium mb-3 text-gray-700">2.1 LINEプロフィール情報</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>ユーザー名（表示名）</li>
                <li>プロフィール画像</li>
                <li>LINE ユーザーID</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3 text-gray-700">2.2 アプリ利用情報</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>アップロードされた写真・画像</li>
                <li>アプリの使用統計データ（機能の利用頻度、利用時間等）</li>
                <li>デバイス情報（OS、ブラウザ情報等）</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. 情報の利用目的</h2>
              <p className="text-gray-700 mb-3">収集した情報は以下の目的で利用いたします：</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>本アプリのサービス提供およびユーザー認証</li>
                <li>AI文字認識およびTTS音声読み上げ機能の提供</li>
                <li>サービスの改善および新機能の開発</li>
                <li>利用統計の分析およびサービス品質の向上</li>
                <li>カスタマーサポートの提供</li>
                <li>有料サービスの提供および課金処理</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. 第三者サービスとの連携</h2>
              <h3 className="text-xl font-medium mb-3 text-gray-700">4.1 AI文字認識サービス</h3>
              <p className="text-gray-700 mb-4">
                本アプリは、OpenAI社のサービスを利用してAI文字認識機能を提供しています。アップロードされた画像は、文字認識処理のためにOpenAI社のサーバーに送信されます。OpenAI社のプライバシーポリシーについては、<a href="https://openai.com/privacy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">こちら</a>をご確認ください。
              </p>
              
              <h3 className="text-xl font-medium mb-3 text-gray-700">4.2 データの第三者共有</h3>
              <p className="text-gray-700 mb-4">
                当社は、法的要求がある場合を除き、お客様の個人情報を第三者と共有することはありません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. データの保存と保護</h2>
              <h3 className="text-xl font-medium mb-3 text-gray-700">5.1 データの保存場所</h3>
              <p className="text-gray-700 mb-4">
                収集された情報は、Vercel社のクラウドサービス上に安全に保存されます。
              </p>
              
              <h3 className="text-xl font-medium mb-3 text-gray-700">5.2 データの保存期間</h3>
              <p className="text-gray-700 mb-4">
                個人情報は、収集から1年間保存されます。保存期間経過後は、適切に削除いたします。
              </p>
              
              <h3 className="text-xl font-medium mb-3 text-gray-700">5.3 セキュリティ対策</h3>
              <p className="text-gray-700 mb-4">
                当社は、お客様の個人情報を不正アクセス、紛失、破壊、改ざん、漏洩から保護するため、適切な技術的・組織的安全管理措置を講じています。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. お客様の権利</h2>
              <p className="text-gray-700 mb-3">お客様は以下の権利を有します：</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>個人情報の開示請求</li>
                <li>個人情報の訂正・削除請求</li>
                <li>個人情報の利用停止請求</li>
                <li>サービスの利用停止（アカウント削除）</li>
              </ul>
              <p className="text-gray-700 mb-4">
                これらの権利を行使される場合は、下記のお問い合わせ先までご連絡ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. プライバシーポリシーの変更</h2>
              <p className="text-gray-700 mb-4">
                当社は、法令の変更やサービスの改善等に伴い、本プライバシーポリシーを変更する場合があります。重要な変更については、アプリ内での通知またはその他の適切な方法でお客様にお知らせいたします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. お問い合わせ</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>会社名：</strong>株式会社PuzzleHunters</p>
                <p className="text-gray-700 mb-2"><strong>住所：</strong>〒161-0032 東京都新宿区中落合二丁目１１番３－２０２号</p>
                <p className="text-gray-700 mb-2"><strong>メールアドレス：</strong>angelsphoto99@gmail.com</p>
              </div>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              アプリに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 