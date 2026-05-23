/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronDown, Check } from "lucide-react";
import { TeamStats } from "../types";

interface TeamSelectorProps {
  selectedTeamId: number;
  onChange: (teamId: number) => void;
  teams: TeamStats[];
  disabledId?: number; // Id of the team to disable (same as other selected slot)
  placeholder?: string;
  className?: string;
}

const getCountryFlag = (country?: string) => {
  if (!country) return "🇧🇷"; // default to Brazil
  const mapped: Record<string, string> = {
    "Brasil": "🇧🇷",
    "Espanha": "🇪🇸",
    "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Alemanha": "🇩🇪",
    "Itália": "🇮🇹"
  };
  return mapped[country] || "🇧🇷";
};

export default function TeamSelector({
  selectedTeamId,
  onChange,
  teams,
  disabledId,
  placeholder = "Selecione um time",
  className = ""
}: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  // Filter teams by search term
  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search and focus input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev + 1 < filteredTeams.length ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredTeams.length) {
          const team = filteredTeams[activeIndex];
          if (team.id !== disabledId) {
            onChange(team.id);
            setIsOpen(false);
          }
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  // Ensure active index is visible during keyboard scrolling
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const activeElement = dropdownRef.current.children[activeIndex + 1] as HTMLElement; // Offset for search input wrapper
      if (activeElement) {
        const dropdown = dropdownRef.current;
        const offsetTop = activeElement.offsetTop;
        const height = activeElement.offsetHeight;
        const viewPortHeight = dropdown.clientHeight;

        if (offsetTop + height > dropdown.scrollTop + viewPortHeight) {
          dropdown.scrollTop = offsetTop + height - viewPortHeight;
        } else if (offsetTop < dropdown.scrollTop) {
          dropdown.scrollTop = offsetTop - 50; // offset for search info
        }
      }
    }
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-900 border border-slate-800 focus:border-emerald-500/50 hover:border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-medium transition duration-250 cursor-pointer min-h-[48px] focus:outline-none"
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedTeam ? (
            <>
              <span className="text-base shrink-0 select-none" title={selectedTeam.country || "Brasil"}>
                {getCountryFlag(selectedTeam.country)}
              </span>
              <img
                src={selectedTeam.logo || "https://media.api-sports.io/football/teams/unknown.png"}
                alt={selectedTeam.name}
                className="w-5 h-5 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-extrabold text-white truncate text-xs sm:text-sm">
                {selectedTeam.name}
              </span>
            </>
          ) : (
            <span className="text-slate-500 text-xs sm:text-sm">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "transform rotate-180 text-emerald-400" : ""
          }`}
        />
      </button>

      {/* Overlay Dropdown List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-full bg-slate-950 border border-slate-850 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Search Input Box */}
            <div className="p-3 border-b border-slate-900 flex items-center gap-2 bg-slate-950 sticky top-0 z-10">
              <Search className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Pesquisar time/clube..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(-1);
                }}
                className="w-full bg-transparent border-0 outline-none text-xs text-white focus:ring-0 placeholder-slate-550 py-1"
                onKeyDown={(e) => {
                  // Prevent input keys from closing selector, handle arrow keys and enter
                  if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
                    e.preventDefault();
                    // trigger standard container keydown logic
                    const syntEvent = {
                      key: e.key,
                      preventDefault: () => {}
                    } as React.KeyboardEvent;
                    handleKeyDown(syntEvent);
                  }
                }}
              />
            </div>

            {/* Teams Items List */}
            <div
              ref={dropdownRef}
              className="max-h-[220px] overflow-y-auto divide-y divide-slate-900/40 select-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800"
            >
              {filteredTeams.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-medium">
                  Nenhum time encontrado.
                </div>
              ) : (
                filteredTeams.map((team, index) => {
                  const isSelected = team.id === selectedTeamId;
                  const isDisabled = team.id === disabledId;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={team.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        onChange(team.id);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-all duration-150 ${
                        isDisabled
                          ? "opacity-35 cursor-not-allowed bg-slate-950 text-slate-600"
                          : isSelected
                          ? "bg-emerald-500/10 text-emerald-400 font-extrabold border-l-2 border-emerald-500"
                          : isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-base shrink-0 select-none" title={team.country || "Brasil"}>
                          {getCountryFlag(team.country)}
                        </span>
                        <img
                          src={team.logo || "https://media.api-sports.io/football/teams/unknown.png"}
                          alt={team.name}
                          className="w-4.5 h-4.5 object-contain shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <span className="truncate">{team.name}</span>
                      </div>
                      
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {isDisabled && (
                        <span className="text-[8px] bg-slate-900 text-slate-500 font-mono tracking-wider font-extrabold uppercase px-1.5 py-0.5 rounded shadow-inner">
                          Já Aberto
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
