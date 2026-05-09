"use client";

import React, { useState } from "react";
import SymptomWizard from "@/components/SymptomWizard";
import { DiagnosisResponse } from "@/lib/api";
import { AlertCircle, Activity, ChevronRight, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function AssessmentPage() {
  const [result, setResult] = useState<DiagnosisResponse | null>(null);

  if (result) {
    // Tampilkan hasil diagnosa
    const topResult = result.results[0]; // Penyakit dengan persentase tertinggi
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-4">
              <Activity className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Hasil Analisis Diagnosa</h1>
            <p className="mt-2 text-lg text-gray-500">Berdasarkan basis pengetahuan pakar klinis.</p>
          </div>

          {topResult && topResult.is_above_threshold ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-teal-100 overflow-hidden"
            >
              <div className="bg-teal-600 px-6 py-8 text-center text-white">
                <p className="text-teal-100 text-sm font-semibold uppercase tracking-wider mb-2">Kemungkinan Terbesar</p>
                <h2 className="text-4xl font-bold">{topResult.disease.name}</h2>
                <p className="mt-2 text-teal-100">Kode: {topResult.disease.code}</p>
              </div>
              
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-gray-700 font-medium">Tingkat Keyakinan (Confidence Score)</span>
                    <span className="text-3xl font-bold text-teal-600">{topResult.score_percentage}%</span>
                  </div>
                  {/* Gauge / Progress Bar */}
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${topResult.score_percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-teal-500 rounded-full"
                    />
                    {/* Threshold Marker */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-red-400 z-10"
                      style={{ left: `${topResult.disease.threshold}%` }}
                      title={`Ambang Batas Minimum: ${topResult.disease.threshold}%`}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-red-500 font-medium flex items-center gap-1" style={{ marginLeft: `calc(${topResult.disease.threshold}% - 2rem)`}}>
                      <AlertCircle className="w-3 h-3" /> Ambang Minimum ({topResult.disease.threshold}%)
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 mt-8 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Gejala yang Berpengaruh</h3>
                  <ul className="space-y-2">
                    {topResult.matched_symptoms.map((sym, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{sym.name}</span>
                        <span className="font-medium px-2 py-0.5 bg-white rounded text-gray-600 border shadow-sm">
                          Bobot: {sym.weight} ({sym.type})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center border border-gray-100">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Tidak Terindikasi</h2>
              <p className="mt-3 text-gray-600 max-w-md mx-auto">
                Berdasarkan gejala yang Anda pilih, tidak ada indikasi penyakit mental yang melampaui ambang batas diagnosis (Confidence Threshold).
              </p>
            </div>
          )}

          <div className="text-center pt-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Ulangi Konsultasi
            </button>
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Formulir Konsultasi</h1>
        <p className="mt-2 text-lg text-gray-500">Jawablah sesuai dengan kondisi Anda saat ini.</p>
      </div>
      
      <SymptomWizard onComplete={setResult} />
    </div>
  );
}

// Minimal CheckCircle import placeholder
const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
);
