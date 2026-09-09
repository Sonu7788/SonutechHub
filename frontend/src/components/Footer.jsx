import React from 'react';
import { Code2, Terminal, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-slate-500 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">
            SonuTech<span className="text-blue-600">Hub</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500">Free Java DSA Practice Platform & Online Compiler</span>
        </div>
        
        <div className="flex items-center space-x-6 text-xs">
          <span className="flex items-center gap-1 text-slate-600">
            <Terminal className="w-3.5 h-3.5 text-blue-600" /> Powered by OpenJDK 24
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Interactive DSA Sheets
          </span>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} SonuTechHub. Code • Practice • Excel.
        </div>
      </div>
    </footer>
  );
}

