"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function UserButton() {
  const { data: session } = useSession();
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

  if (!session) {
    return (
      <a
        href="/login"
        className="px-4 py-2 text-sm bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg transition-colors"
      >
        Sign In
      </a>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full border border-cyber-border"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-cyber-accent flex items-center justify-center text-white text-sm font-medium">
            {session.user?.name?.[0] || "U"}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-cyber-panel border border-cyber-border rounded-lg shadow-xl z-50">
          <div className="px-4 py-3 border-b border-cyber-border">
            <p className="text-sm font-medium text-cyber-text truncate">
              {session.user?.name}
            </p>
            <p className="text-xs text-cyber-muted truncate">
              {session.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-4 py-2 text-sm text-cyber-muted hover:text-cyber-accent hover:bg-cyber-border/50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
