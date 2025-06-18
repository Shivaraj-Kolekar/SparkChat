export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">SparkChat API</h1>
        <p className="text-gray-600 mb-4">
          Welcome to the SparkChat backend API server.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• API endpoints are available at /api/*</p>
          <p>• Authentication routes at /api/auth/*</p>
          <p>• Chat endpoints at /api/chat/*</p>
          <p>• AI endpoints at /api/ai</p>
        </div>
      </div>
    </div>
  );
}
