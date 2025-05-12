"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Map, Info, Footprints, Plus } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle scroll effect - keeping original logic
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Path check function - keeping original logic
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[#211510]/90 backdrop-blur-md shadow-md" 
          : "bg-[#211510]/70 backdrop-blur-sm"
      } border-b border-[#8B4513]/30`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-[#D4BE94] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#8B4513] shadow-md">
                <Image src="/compass.svg" alt="Logo" width={20} height={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#F5E6C8] font-serif">
                EUREKA!
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link
              href="/"
              className={`px-1 py-2 text-sm font-medium relative group flex items-center ${
                isActive('/') 
                  ? "text-[#D4BE94] font-bold" 
                  : "text-[#D4BE94] hover:text-[#F5E6C8] transition-colors"
              }`}
            >
              <Map className="h-4 w-4 mr-1.5" />
              Home
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#D4BE94] transition-all duration-300 ${
                isActive('/') ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            
            <Link
              href="/about"
              className={`px-1 py-2 text-sm font-medium relative group flex items-center ${
                isActive('/about') 
                  ? "text-[#D4BE94] font-bold" 
                  : "text-[#D4BE94] hover:text-[#F5E6C8] transition-colors"
              }`}
            >
              <Info className="h-4 w-4 mr-1.5" />
              How to play
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#D4BE94] transition-all duration-300 ${
                isActive('/about') ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            
            <Link
              href="/footprints"
              className={`px-1 py-2 text-sm font-medium relative group flex items-center ${
                isActive('/footprints') 
                  ? "text-[#D4BE94] font-bold" 
                  : "text-[#D4BE94] hover:text-[#F5E6C8] transition-colors"
              }`}
            >
              <Footprints className="h-4 w-4 mr-1.5" />
              My Footprints
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#D4BE94] transition-all duration-300 ${
                isActive('/footprints') ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            
            <Link
              href="/createQuest"
              className={`px-1 py-2 text-sm font-medium relative group flex items-center ${
                isActive('/createQuest') 
                  ? "text-[#D4BE94] font-bold" 
                  : "text-[#D4BE94] hover:text-[#F5E6C8] transition-colors"
              }`}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Quest
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#D4BE94] transition-all duration-300 ${
                isActive('/createQuest') ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#D4BE94] hover:bg-[#3A2112]/30 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!menuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${menuOpen ? "block" : "hidden"} bg-[#211510]/95 backdrop-blur-md border-t border-[#8B4513]/30`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/') 
                ? "bg-[#3A2112]/70 text-[#F5E6C8] font-bold" 
                : "text-[#D4BE94] hover:bg-[#3A2112]/50 hover:text-[#F5E6C8]"
            } flex items-center`}
            onClick={() => setMenuOpen(false)}
          >
            <Map className="h-5 w-5 mr-2" />
            Home
          </Link>
          
          <Link
            href="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/about') 
                ? "bg-[#3A2112]/70 text-[#F5E6C8] font-bold" 
                : "text-[#D4BE94] hover:bg-[#3A2112]/50 hover:text-[#F5E6C8]"
            } flex items-center`}
            onClick={() => setMenuOpen(false)}
          >
            <Info className="h-5 w-5 mr-2" />
            How to play
          </Link>
          
          <Link
            href="/footprints"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/footprints') 
                ? "bg-[#3A2112]/70 text-[#F5E6C8] font-bold" 
                : "text-[#D4BE94] hover:bg-[#3A2112]/50 hover:text-[#F5E6C8]"
            } flex items-center`}
            onClick={() => setMenuOpen(false)}
          >
            <Footprints className="h-5 w-5 mr-2" />
            My Footprints
          </Link>
          
          <Link
            href="/createQuest"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/createQuest') 
                ? "bg-[#3A2112]/70 text-[#F5E6C8] font-bold" 
                : "text-[#D4BE94] hover:bg-[#3A2112]/50 hover:text-[#F5E6C8]"
            } flex items-center`}
            onClick={() => setMenuOpen(false)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Quest
          </Link>
        </div>
      </div>
    </nav>
  );
}