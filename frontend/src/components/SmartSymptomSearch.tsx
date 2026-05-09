"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Fuse from "fuse.js";
import { Search, X, Brain, AlertCircle } from "lucide-react";
import { fetchSymptoms, submitDiagnosis, CategoryGroup, Symptom, DiagnosisResponse } from "@/lib/api";

interface SmartSymptomSearchProps {
  onComplete: (result: DiagnosisResponse) => void;
}

const MIN_CHARS = 4;
const MIN_SELECTION = 3;

export default function SmartSymptomSearch({ onComplete }: SmartSymptomSearchProps) {
  const [allSymptoms, setAllSymptoms] = useState<Symptom[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Symptom[]>([]);
  const [selected, setSelected] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const fuseRef = useRef<Fuse<Symptom> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const groups: CategoryGroup[] = await fetchSymptoms();
      const flat: Symptom[] = groups.flatMap((g) => g.symptoms);
      setAllSymptoms(flat);
      fuseRef.current = new Fuse(flat, {
        keys: ["name", "description", "code"],
        threshold: 0.4,       // fuzzy tolerance
        minMatchCharLength: 2,
        includeScore: true,
      });
      setIsLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!fuseRef.current || query.length < MIN_CHARS) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const results = fuseRef.current
      .search(query)
      .map((r) => r.item)
      .filter((s) => !selected.find((sel) => sel.id === s.id))
      .slice(0, 8);
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  }, [query, selected]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectSymptom = useCallback((symptom: Symptom) => {
    if (selected.find((s) => s.id === symptom.id)) return;
    setSelected((prev) => [...prev, symptom]);
    setQuery("");
    setShowDropdown(false);
  }, [selected]);

  const removeSymptom = useCallback((id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleSubmit = async () => {
    if (selected.length < MIN_SELECTION || isSubmitting) return;
    setIsSubmitting(true);
    const result = await submitDiagnosis(selected.map((s) => s.id));
    if (result) {
      onComplete(result);
    } else {
      alert("Gagal menghubungi server. Pastikan backend aktif di port 8000.");
      setIsSubmitting(false);
    }
  };

  const isReady = selected.length >= MIN_SELECTION;

  // --- Skeleton Loading ---
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
        <div className="h-4 w-48 bg-gray-200 rounded mx-auto" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">

      {/* Search Input */}
      <div ref={wrapperRef} className="relative">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Cari Gejala yang Anda Rasakan
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= MIN_CHARS && setShowDropdown(true)}
            placeholder={`Ketik minimal ${MIN_CHARS} karakter... (contoh: "cemas", "tidur", "sedih")`}
            className="w-full pl-11 pr-4 py-3.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
              placeholder:text-slate-400 text-slate-800 transition-all"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setShowDropdown(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search hint */}
        {query.length > 0 && query.length < MIN_CHARS && (
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Ketik {MIN_CHARS - query.length} karakter lagi untuk memulai pencarian
          </p>
        )}

        {/* Dropdown Results */}
        {showDropdown && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {searchResults.map((symptom) => (
              <button
                key={symptom.id}
                onMouseDown={(e) => { e.preventDefault(); selectSymptom(symptom); }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-teal-50 border-b border-slate-50 last:border-0 transition-colors group"
              >
                <span className="block font-medium text-slate-800 group-hover:text-teal-700">
                  {symptom.name}
                </span>
                {symptom.description && (
                  <span className="block text-xs text-slate-400 mt-0.5 truncate">
                    {symptom.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Symptom Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-600">
            Gejala Terpilih
          </h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isReady ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
          }`}>
            {selected.length} / min. {MIN_SELECTION}
          </span>
        </div>

        {selected.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-center">
            <Brain className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">Gejala yang Anda pilih akan muncul di sini</p>
            <p className="text-xs text-slate-300 mt-1">Pilih minimal {MIN_SELECTION} gejala untuk memulai diagnosa</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((symptom) => (
              <span
                key={symptom.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 
                  text-teal-800 text-sm font-medium rounded-full group transition-all hover:border-teal-400"
              >
                {symptom.name}
                <button
                  onClick={() => removeSymptom(symptom.id)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-teal-200 transition-colors"
                  aria-label={`Hapus ${symptom.name}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        {!isReady && selected.length > 0 && (
          <p className="text-xs text-amber-600 flex items-center gap-1.5 mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            Tambahkan {MIN_SELECTION - selected.length} gejala lagi untuk mengaktifkan diagnosa.
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isReady || isSubmitting}
          className={`w-full py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-200
            flex items-center justify-center gap-2
            ${isReady && !isSubmitting
              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 hover:-translate-y-0.5"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Menganalisis data Anda...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Proses Diagnosa
            </>
          )}
        </button>
      </div>

    </div>
  );
}
