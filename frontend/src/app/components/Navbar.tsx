"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Map, Info, Footprints } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // All items will now show as active when on home route
  const isActive = (path: string) => {
    return pathname === path
      ? "text-white border-b-2 border-white"
      : "text-gray-300 hover:text-white transition-colors";
  };

  return (
    <nav 
      className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/80 backdrop-blur-md border-b border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Now links to home */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                EUREKA!
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link
              href="/"
              className={`px-1 py-2 text-sm font-medium ${isActive('/')} relative group flex items-center`}
            >
              <Map className="h-4 w-4 mr-1.5" />
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link
              href="/about"
              className={`px-1 py-2 text-sm font-medium ${isActive('/about')} relative group flex items-center`}
            >
              <Info className="h-4 w-4 mr-1.5" />
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link
              href="/footprints"
              className={`px-1 py-2 text-sm font-medium ${isActive('/footprints')} relative group flex items-center`}
            >
              <Footprints className="h-4 w-4 mr-1.5" />
              My Footprints
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link
              href="/"
              className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
            >
              Start Hunt
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
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
      <div className={`md:hidden ${menuOpen ? "block" : "hidden"} bg-black/95 backdrop-blur-md border-t border-gray-800`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname === "/" 
                ? "bg-gray-900 text-white" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            } flex items-center`}
            onClick={() => setMenuOpen(false)}
          >
            <Map className="h-5 w-5 mr-2" />
            Home
          </Link>
          
          <Link
            href="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname === "/about" 
                ? "bg-gray-900 text-white" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            } flex items-center`}
            onClick={() => setMenuOpen(false)}
          >
            <Info className="h-5 w-5 mr-2" />
            About
          </Link>
          
          <Link
            href="/footprints"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname === "/footprints" 
                ? "bg-gray-900 text-white" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            } flex items-center`}
            onClick={() => setMenuOpen(false)}
          >
            <Footprints className="h-5 w-5 mr-2" />
            My Footprints
          </Link>
          
          <Link
            href="/"
            className="block px-3 py-2 mt-4 rounded-md text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center"
            onClick={() => setMenuOpen(false)}
          >
            <Map className="h-5 w-5 mr-2" />
            Start Hunt
          </Link>
        </div>
      </div>
    </nav>
  );
}