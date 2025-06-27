export default function BasicPage() {
  return (
    <div className="min-h-screen p-4 bg-green-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-green-600">
          基础测试页面
        </h1>
        
        <div className="space-y-4">
          <div className="p-3 bg-green-100 rounded">
            <p className="text-green-800">✅ Next.js 正常工作</p>
          </div>
          
          <div className="p-3 bg-blue-100 rounded">
            <p className="text-blue-800">📱 这是一个静态页面，不依赖LIFF</p>
          </div>
          
          <div className="p-3 bg-yellow-100 rounded">
            <p className="text-yellow-800">🔧 用于验证基础部署是否正常</p>
          </div>
        </div>

        <div className="mt-6">
          <a 
            href="/" 
            className="block w-full text-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            返回主页
          </a>
        </div>
      </div>
    </div>
  );
} 