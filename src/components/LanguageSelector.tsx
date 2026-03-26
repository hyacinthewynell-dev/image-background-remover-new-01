"use client";

import { useState, useRef, useEffect } from "react";
import { Language, languages } from "@/lib/translations";

interface LanguageSelectorProps {
  currentLang: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageSelector({ currentLang, onChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLanguage = languages.find(l => l.code === currentLang);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-cyber-muted hover:text-cyber-accent transition-colors border border-cyber-border rounded-lg hover:border-cyber-accent/50"
      >
        <span>🌐</span>
        <span>{currentLanguage?.nativeName}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 max-h-80 overflow-y-auto bg-cyber-panel border border-cyber-border rounded-lg shadow-xl z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-cyber-border/50 transition-colors ${
                currentLang === lang.code
                  ? "text-cyber-accent bg-cyber-accent/10"
                  : "text-cyber-text"
              }`}
            >
              <div className="font-medium">{lang.nativeName}</div>
              <div className="text-xs text-cyber-muted">{lang.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
