"use client";

import React, { useState, useEffect } from "react";
import { fetchSymptoms, submitDiagnosis, CategoryGroup, DiagnosisResponse } from "@/lib/api";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SymptomWizardProps {
  onComplete: (result: DiagnosisResponse) => void;
}

export default function SymptomWizard({ onComplete }: SymptomWizardProps) {
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await fetchSymptoms();
      setCategories(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const toggleSymptom = (id: string) => {
    const next = new Set(selectedSymptoms);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedSymptoms(next);
  };

  const handleNext = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await submitDiagnosis(Array.from(selectedSymptoms));
    if (result) {
      onComplete(result);
    } else {
      alert("Terjadi kesalahan saat menghubungi server.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <p className="text-gray-500 animate-pulse">Memuat basis pengetahuan klinis...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return <div className="text-center py-10 text-red-500">Gagal memuat data gejala. Pastikan backend aktif.</div>;
  }

  const currentCategory = categories[currentStep];
  const progressPercentage = ((currentStep + 1) / categories.length) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100">
        <div 
          className="h-full bg-teal-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="p-8">
        <div className="mb-8">
          <span className="text-sm font-semibold text-teal-600 tracking-wider uppercase">
            Langkah {currentStep + 1} dari {categories.length}
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            Kategori: {currentCategory.category}
          </h2>
          <p className="text-gray-500 mt-1">
            Pilih gejala yang Anda rasakan selama 2 minggu terakhir. Lewati jika tidak ada.
          </p>
        </div>

        <div className="space-y-3 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {currentCategory.symptoms.map((symptom) => {
                const isSelected = selectedSymptoms.has(symptom.id);
                return (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4
                      ${isSelected 
                        ? 'border-teal-500 bg-teal-50/50 shadow-sm' 
                        : 'border-gray-100 hover:border-teal-200 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border
                      ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}
                    >
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <h3 className={`font-medium ${isSelected ? 'text-teal-900' : 'text-gray-900'}`}>
                        {symptom.name}
                      </h3>
                      {symptom.description && (
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                          {symptom.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <div className="text-sm text-gray-400 font-medium">
            {selectedSymptoms.size} Gejala Terpilih
          </div>

          {currentStep === categories.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedSymptoms.size === 0}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-teal-600/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  Lihat Hasil
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
