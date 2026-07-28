import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import {
  FiHome,
  FiHeart,
  FiBarChart2,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiUser
} from 'react-icons/fi';
import { WiDaySunny } from 'react-icons/wi';

const NavLink = ({ to, icon: Icon, label, active }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
          : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon size={16} />
      <span className="text-sm font-medium font-body">
        {label}
      </span>
    </motion.div>
  </Link>
);

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const { lastUpdated } = useSelector(
    (s) => s.weather
  );

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const navLinks = [
    {
      to: '/',
      icon: FiHome,
      label: 'Dashboard'
    },
    {
      to: '/favorites',
      icon: FiHeart,
      label: 'Favorites'
    },
    {
      to: '/compare',
      icon: FiBarChart2,
      label: 'Compare'
    },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="glass-card mx-4 mt-3 rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-neon"
            >
              <WiDaySunny
                className="text-white"
                size={20}
              />
            </motion.div>

            <div>
              <span className="font-display font-bold text-white text-lg leading-none">
                SkyPulse
              </span>

              <div className="text-white/40 text-[10px] font-mono leading-none">
                WEATHER
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                {...link}
                active={
                  location.pathname === link.to
                }
              />
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">

            {lastUpdated && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />

                <span className="text-white/50 text-xs font-mono">
                  Live
                </span>
              </div>
            )}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'moon' : 'sun'}
                  initial={{
                    rotate: -90,
                    opacity: 0
                  }}
                  animate={{
                    rotate: 0,
                    opacity: 1
                  }}
                  exit={{
                    rotate: 90,
                    opacity: 0
                  }}
                  transition={{
                    duration: 0.2
                  }}
                >
                  {isDark ? (
                    <FiMoon size={15} />
                  ) : (
                    <FiSun size={15} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Info Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setUserMenuOpen(
                    !userMenuOpen
                  )
                }
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-neon"
              >
                <FiUser size={14} />
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      y: -10
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      y: -10
                    }}
                    className="absolute right-0 top-12 glass-card rounded-xl p-2 min-w-[180px]"
                  >
                    <div className="px-3 py-2 text-sm text-white/70">
                      SkyPulse Weather
                    </div>

                    <div className="px-3 py-2 text-xs text-white/40 border-t border-white/10">
                      Weather Dashboard
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                setMobileOpen(!mobileOpen)
              }
              className="md:hidden w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/70"
            >
              {mobileOpen ? (
                <FiX size={16} />
              ) : (
                <FiMenu size={16} />
              )}
            </motion.button>

          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0
              }}
              animate={{
                height: 'auto',
                opacity: 1
              }}
              exit={{
                height: 0,
                opacity: 0
              }}
              transition={{
                duration: 0.3
              }}
              className="overflow-hidden md:hidden"
            >
              <div className="flex flex-col gap-1 pt-3 border-t border-white/10 mt-3">
                {navLinks.map((link) => (
                  <div
                    key={link.to}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                  >
                    <NavLink
                      {...link}
                      active={
                        location.pathname ===
                        link.to
                      }
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.nav>
  );
};

export default Navbar;