export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <main className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Sistem Pakar Kesehatan Mental
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Aplikasi deteksi dini kondisi kesehatan mental berbasis sistem pakar (Weighted Scoring).
        </p>
        <div className="pt-4">
          <a
            href="/assessment"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Mulai Diagnosa
          </a>
        </div>
      </main>
    </div>
  );
}
