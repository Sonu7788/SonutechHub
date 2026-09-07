import React from 'react';
import { Code2, Terminal, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#090d16] py-8 text-gray-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-white tracking-tight">SonuTechHub</span>
          <span className="text-gray-600">|</span>
          <span className="text-xs text-gray-500">Java DSA Practice Platform & Online Compiler</span>
        </div>
        
        <div className="flex items-center space-x-6 text-xs">
          <span className="flex items-center gap-1 text-gray-400">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Powered by OpenJDK 24
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Bulk Question Importer
          </span>
        </div>

        <div className="text-xs text-gray-500">
          © {new Date().getFullYear()} SonuTechHub. Built for aspiring software engineers.
        </div>
      </div>
    </footer>
  );
}
