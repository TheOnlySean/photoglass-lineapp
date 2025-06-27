import Link from 'next/link';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            利用規約
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              最終更新日：2025年6月27日
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第1条（適用）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本利用規約（以下「本規約」）は、株式会社PuzzleHunters（以下「当社」）が提供する「写真眼鏡」（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただくお客様（以下「ユーザー」）には、本規約に同意いただいたものとみなします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第2条（サービス内容）</h2>
              <p className="text-gray-700 mb-3">本サービスは、以下の機能を提供します：</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>写真・画像内の文字をAI技術により認識・抽出する機能</li>
                <li>認識した文字をTTS（Text-to-Speech）技術により音声で読み上げる機能</li>
                <li>認識結果の保存・共有機能</li>
                <li>有料プレミアム機能（高精度認識、無制限利用等）</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第3条（利用資格）</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>本サービスは、13歳以上の方がご利用いただけます</li>
                <li>18歳未満の方は、保護者の同意を得てからご利用ください</li>
                <li>LINEアカウントを保有していることが必要です</li>
                <li>日本国内でのご利用を前提としています</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第4条（アカウント管理）</h2>
              <p className="text-gray-700 mb-4">
                ユーザーは、LINEアカウントを通じて本サービスを利用します。LINEアカウントの管理はユーザーの責任において行い、第三者による不正利用を防止するための適切な措置を講じてください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第5条（禁止事項）</h2>
              <p className="text-gray-700 mb-3">ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません：</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>法令に違反する行為、または違反するおそれのある行為</li>
                <li>著作権、肖像権、プライバシー権等の第三者の権利を侵害する画像のアップロード</li>
                <li>わいせつ、暴力的、差別的な内容を含む画像のアップロード</li>
                <li>個人情報、機密情報、機密文書等の画像のアップロード</li>
                <li>当社または第三者に不利益、損害、不快感を与える行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>不正アクセス、リバースエンジニアリング等の技術的攻撃行為</li>
                <li>商用利用、営利目的での大量利用（プレミアムプラン除く）</li>
                <li>本サービスで得た情報を第三者に販売、譲渡する行為</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第6条（有料サービス）</h2>
              <h3 className="text-xl font-medium mb-3 text-gray-700">6.1 プレミアムプラン</h3>
              <p className="text-gray-700 mb-4">
                当社は、有料のプレミアムプランを提供します。料金、支払い方法、解約手続き等の詳細は、アプリ内でご確認ください。
              </p>
              
              <h3 className="text-xl font-medium mb-3 text-gray-700">6.2 返金</h3>
              <p className="text-gray-700 mb-4">
                有料サービスの料金は、原則として返金いたしません。ただし、当社に起因する重大な不具合等がある場合は、この限りではありません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第7条（知的財産権）</h2>
              <p className="text-gray-700 mb-4">
                本サービスに関する知的財産権は、当社または当社にライセンスを許諾した権利者に帰属します。ユーザーがアップロードした画像の著作権は、ユーザーに帰属しますが、サービス提供に必要な範囲で当社が利用することを許諾していただきます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第8条（免責事項）</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>AI文字認識の精度は100%を保証するものではありません</li>
                <li>認識結果の正確性について、当社は一切の責任を負いません</li>
                <li>本サービスの一時的な停止、中断について、当社は責任を負いません</li>
                <li>ユーザーが本サービスを利用して行った行為により生じた損害について、当社は責任を負いません</li>
                <li>第三者サービス（OpenAI等）の障害による影響について、当社は責任を負いません</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第9条（サービスの変更・停止）</h2>
              <p className="text-gray-700 mb-4">
                当社は、ユーザーへの事前通知をもって、本サービスの内容を変更、追加、削除することができます。また、当社の判断により、本サービスの提供を一時的または永続的に停止することができます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第10条（利用規約の変更）</h2>
              <p className="text-gray-700 mb-4">
                当社は、必要に応じて本規約を変更することができます。変更後の規約は、アプリ内での通知またはウェブサイトでの公表により効力を生じます。変更後も本サービスを継続してご利用いただく場合、変更後の規約に同意いただいたものとみなします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第11条（準拠法・管轄裁判所）</h2>
              <p className="text-gray-700 mb-4">
                本規約は、日本法に準拠して解釈されます。本サービスに関して紛争が生じた場合、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">第12条（お問い合わせ）</h2>
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