"use client";

import React, { useState } from "react";
import SmartSymptomSearch from "@/components/SmartSymptomSearch";
import { DiagnosisResponse } from "@/lib/api";
import { AlertCircle, Activity, RotateCcw, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AssessmentPage() {
  const [result, setResult] = useState<DiagnosisResponse | null>(null);

  // ---- RESULTS VIEW ----
  if (result) {
    const topResult = result.results[0];
    const hasPositive = topResult && topResult.is_above_threshold;

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 mb-5">
              <Activity className="w-7 h-7 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Hasil Analisis Diagnosa</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Berdasarkan basis pengetahuan pakar klinis — {result.results.length} kondisi dianalisis
            </p>
          </div>

          {/* Primary Result */}
          {hasPositive ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* Disease Header */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-6 py-8 text-center text-white">
                <p className="text-teal-200 text-xs font-semibold uppercase tracking-widest mb-2">
                  Kondisi Terindikasi
                </p>
                <h2 className="text-3xl font-bold">{topResult.disease.name}</h2>
                <p className="mt-1 text-teal-200 text-sm">Kode Diagnosa: {topResult.disease.code}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Score Visualization */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-sm font-medium text-slate-600">Tingkat Keyakinan</span>
                    <span className="text-2xl font-bold text-teal-600">{topResult.score_percentage}%</span>
                  </div>

                  {/* Progress Bar with Threshold Marker */}
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-visible">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(topResult.score_percentage, 100)}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-teal-500 rounded-full"
                    />
                    {/* Threshold marker line */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-red-400 rounded-full z-10"
                      style={{ left: `${topResult.disease.threshold}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>0%</span>
                    <span className="flex items-center gap-1 text-red-500 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Ambang Minimum: {topResult.disease.threshold}%
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Matched Symptoms */}
                {topResult.matched_symptoms.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Gejala yang Berkontribusi ({topResult.matched_symptoms.length})
                    </h3>
                    <div className="space-y-2">
                      {topResult.matched_symptoms.map((sym, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-sm border border-slate-100"
                        >
                          <span className="text-slate-700">{sym.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              {sym.type}
                            </span>
                            <span className="font-semibold text-teal-700 text-xs">
                              Bobot: {sym.weight}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other results summary */}
                {result.results.length > 1 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Hasil Lainnya</h3>
                    <div className="space-y-2">
                      {result.results.slice(1, 4).map((r, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg border border-slate-100">
                          <div className="flex-1">
                            <span className="text-sm text-slate-600">{r.disease.name}</span>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5">
                              <div
                                className={`h-full rounded-full ${r.is_above_threshold ? "bg-amber-400" : "bg-slate-200"}`}
                                style={{ width: `${Math.min(r.score_percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-xs font-semibold min-w-[3rem] text-right ${r.is_above_threshold ? "text-amber-600" : "text-slate-400"}`}>
                            {r.score_percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-2xl mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Tidak Terindikasi</h2>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Berdasarkan gejala yang Anda laporkan, tidak ada kondisi yang melampaui ambang batas diagnosis minimal yang ditetapkan.
              </p>
            </motion.div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Hasil ini bersifat indikatif dan tidak menggantikan diagnosis profesional. Konsultasikan dengan psikolog atau psikiater berlisensi untuk penanganan lebih lanjut.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setResult(null)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Ulangi Konsultasi
            </button>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              Kembali ke Beranda
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ---- ASSESSMENT FORM VIEW ----
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-teal-600 transition-colors mb-6">
            <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Kembali ke Beranda
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Formulir Konsultasi</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Cari dan pilih gejala yang Anda rasakan selama 2 minggu terakhir.
            Minimal 3 gejala diperlukan untuk mendapatkan hasil yang valid.
          </p>
        </div>

        {/* Smart Search Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <SmartSymptomSearch onComplete={setResult} />
        </div>

      </div>
    </div>
  );
}
