import React from "react";
import { googleLoginUrl } from "../api";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8.1 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.1 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.5 36.6 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

export default function LoginScreen() {
  return (
    <div className="min-h-screen bg-[#0F3652] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-[#EFE1BA] text-[#241C10] rounded-lg p-8 text-center relative">
        <div className="absolute inset-2 border border-[#241C10]/15 rounded pointer-events-none" />

        <p className="text-xs uppercase tracking-[0.3em] text-[#241C10]/50 mb-2">Marine records office</p>
        <h1 className="font-serif text-2xl font-bold mb-1">Wanted</h1>
        <p className="text-sm text-[#241C10]/60 mb-6">for tracking down every episode and omnibus.</p>

        <div className="w-24 h-24 mx-auto rounded-full border-2 border-[#241C10]/30 border-dashed mb-6 flex items-center justify-center text-[#241C10]/30 text-xs">
          your face here
        </div>

        <a
          href={googleLoginUrl()}
          className="inline-flex items-center gap-3 bg-white text-[#241C10] px-5 py-2.5 rounded-md border border-[#241C10]/15 hover:border-[#241C10]/30 transition-colors font-medium text-sm w-full justify-center"
        >
          <GoogleIcon />
          Sign in with Google
        </a>

        <p className="text-[11px] text-[#241C10]/40 mt-6">
          Dead or alive, your progress gets saved either way.
        </p>
      </div>
    </div>
  );
}