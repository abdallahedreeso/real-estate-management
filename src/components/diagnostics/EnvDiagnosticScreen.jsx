import React, { useState } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  RefreshCw, 
  Terminal,
  Database,
  ShieldAlert
} from "lucide-react";

export default function EnvDiagnosticScreen({ missingKeys }) {
  const [copied, setCopied] = useState(false);

  const envTemplate = `# Clerk Authentication Configuration
VITE_CLERK_PUBLISHABLE_KEY=${import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "your_clerk_publishable_key_here"}

# Supabase Database Configuration
VITE_SUPABASE_URL=${import.meta.env.VITE_SUPABASE_URL || "your_supabase_url_here"}
VITE_SUPABASE_ANON_KEY=${import.meta.env.VITE_SUPABASE_ANON_KEY || "your_supabase_anon_key_here"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const keysStatus = [
    {
      name: "VITE_CLERK_PUBLISHABLE_KEY",
      loaded: !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
      description: "Enables User Authentication & Session Management via Clerk.",
      source: "Clerk Dashboard > API Keys",
      url: "https://dashboard.clerk.com/",
    },
    {
      name: "VITE_SUPABASE_URL",
      loaded: !!import.meta.env.VITE_SUPABASE_URL,
      description: "The API Gateway URL of your Supabase database instance.",
      source: "Supabase Dashboard > Settings > API",
      url: "https://supabase.com/dashboard",
    },
    {
      name: "VITE_SUPABASE_ANON_KEY",
      loaded: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      description: "The Public Anonymous Client API key for Supabase query execution.",
      source: "Supabase Dashboard > Settings > API",
      url: "https://supabase.com/dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 pb-6 border-b border-slate-850">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 animate-pulse">
            <ShieldAlert size={36} />
          </div>
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
              Missing Environment Variables
            </h1>
            <p className="text-sm text-slate-400">
              The project requires authentication and database API keys to start. Follow the configuration steps below to get running.
            </p>
          </div>
        </div>

        {/* Diagnostic Status Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Terminal size={14} /> System Check Diagnostics
          </h2>
          <div className="grid gap-3">
            {keysStatus.map((status) => (
              <div 
                key={status.name}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  status.loaded 
                    ? "bg-emerald-950/10 border-emerald-900/40 text-slate-300 hover:border-emerald-800/60" 
                    : "bg-rose-950/10 border-rose-900/40 text-slate-300 hover:border-rose-800/60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-sm font-bold tracking-wide break-all block">
                      {status.name}
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      {status.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {status.loaded ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                        <AlertCircle size={12} /> Missing
                      </span>
                    )}
                  </div>
                </div>

                {!status.loaded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500">
                      Obtain from: <strong className="text-slate-400">{status.source}</strong>
                    </span>
                    <a 
                      href={status.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 font-medium transition-colors"
                    >
                      Open Dashboard <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Setup Guide */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Database size={14} /> Quick Start Setup Guide
            </h2>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 active:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy size={13} /> Copy Template
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a file named <code className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">.env</code> in the root of your project directory, paste the template below, and replace the placeholder values with your keys:
            </p>
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
              <div className="absolute top-3 right-3 text-slate-600 pointer-events-none select-none">
                ENV TEMPLATE
              </div>
              <pre className="p-4 text-slate-300 overflow-x-auto selection:bg-purple-500/40">
                {envTemplate}
              </pre>
            </div>
          </div>
        </div>

        {/* Diagnostics Actions */}
        <div className="pt-4 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock size={12} className="text-slate-500" />
            <span>Values starting with <code className="text-slate-300">VITE_</code> are exposed to the client bundle.</span>
          </div>
          <button
            onClick={handleReload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <RefreshCw size={14} /> Check Status Again
          </button>
        </div>

      </div>

      <div className="mt-8 text-center text-xs text-slate-600">
        Real Estate Management System • Built with React, Supabase, and Clerk.
      </div>
    </div>
  );
}
