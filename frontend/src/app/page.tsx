import Link from "next/link";
import { Brain, ShieldCheck, ChevronRight, ClipboardList } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Placeholder */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-tight">MindDiagnose</span>
          </div>
          <Link
            href="/assessment"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
          >
            Mulai Diagnosa <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Berbasis Metode Weighted Scoring
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Kenali Kondisi <br />
              <span className="text-teal-600">Kesehatan Mental</span>
              <br />Anda Lebih Awal
            </h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-md">
              Sistem pakar berbasis ilmu klinis untuk mendeteksi dini 14 kondisi kesehatan mental dari 82 gejala tervalidasi.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 hover:-translate-y-0.5 transition-all"
              >
                <ClipboardList className="w-4 h-4" />
                Mulai Konsultasi
              </Link>
              <span className="text-xs text-slate-400">Gratis, tanpa akun</span>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-full aspect-square max-w-sm rounded-3xl bg-gradient-to-br from-teal-50 to-slate-100 border-2 border-dashed border-teal-200 flex flex-col items-center justify-center gap-3 text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="space-y-2 w-full">
                <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4 mx-auto" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2 mx-auto" />
              </div>
              <p className="text-xs text-slate-400 mt-2">Hero Image — akan disuplai</p>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="border-y border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-3 divide-x divide-slate-100 text-center">
            {[
              { value: "14", label: "Kondisi Terdeteksi" },
              { value: "82", label: "Gejala Klinis" },
              { value: "147", label: "Aturan Basis Pengetahuan" },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-2">
                <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-10">Cara Kerja</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Search className="w-5 h-5 text-teal-600" />,
                title: "Cari Gejala",
                desc: "Gunakan smart search untuk menemukan gejala yang Anda rasakan dengan mudah.",
              },
              {
                icon: <ClipboardList className="w-5 h-5 text-teal-600" />,
                title: "Pilih Minimal 3",
                desc: "Pilih minimal 3 gejala untuk memastikan hasil diagnosa yang akurat dan valid.",
              },
              {
                icon: <Activity className="w-5 h-5 text-teal-600" />,
                title: "Lihat Hasil",
                desc: "Mesin inferensi akan menghitung skor dan menampilkan kondisi yang paling relevan.",
              },
            ].map((step, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-slate-800">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            MindDiagnose — Sistem Pakar Kesehatan Mental. Hanya untuk keperluan edukasi.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Data tidak disimpan secara permanen
          </div>
        </div>
      </footer>

    </div>
  );
}

// Inline icon imports untuk page ini (server component)
function Search({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );
}
function Activity({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}
