'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

interface HeaderProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

// SVGs de bandeira inline
const FlagBR = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2"><rect width="20" height="14" rx="2" fill="#29B6D1"/><ellipse cx="10" cy="7" rx="5" ry="5" fill="#F7D117"/><ellipse cx="10" cy="7" rx="3.5" ry="3.5" fill="#29B6D1"/><path d="M6.5 7C6.5 7 8 8.5 10 8.5C12 8.5 13.5 7 13.5 7" stroke="#F7D117" strokeWidth="0.8" strokeLinecap="round"/></svg>
)
const FlagUS = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2"><rect width="20" height="14" rx="2" fill="#F5F5F5"/><rect y="1.4" width="20" height="1.4" fill="#EA4335"/><rect y="4.2" width="20" height="1.4" fill="#EA4335"/><rect y="7" width="20" height="1.4" fill="#EA4335"/><rect y="9.8" width="20" height="1.4" fill="#EA4335"/><rect y="12.6" width="20" height="1.4" fill="#EA4335"/><rect width="8" height="7" fill="#4285F4"/><g fill="#F5F5F5"><circle cx="1.2" cy="1" r="0.4"/><circle cx="2.8" cy="1" r="0.4"/><circle cx="4.4" cy="1" r="0.4"/><circle cx="6" cy="1" r="0.4"/><circle cx="1.2" cy="2.5" r="0.4"/><circle cx="2.8" cy="2.5" r="0.4"/><circle cx="4.4" cy="2.5" r="0.4"/><circle cx="6" cy="2.5" r="0.4"/><circle cx="1.2" cy="4" r="0.4"/><circle cx="2.8" cy="4" r="0.4"/><circle cx="4.4" cy="4" r="0.4"/><circle cx="6" cy="4" r="0.4"/><circle cx="1.2" cy="5.5" r="0.4"/><circle cx="2.8" cy="5.5" r="0.4"/><circle cx="4.4" cy="5.5" r="0.4"/><circle cx="6" cy="5.5" r="0.4"/></g></svg>
)

export function Header({ user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications] = useState(3)
  const [isDark, setIsDark] = useState(false)
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    router.push('/login')
  }

  // Função para trocar idioma mantendo a página atual
  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value
    // Mantém o pathname, apenas troca o prefixo do idioma
    const segments = pathname.split('/')
    if (segments[1] === 'pt-BR' || segments[1] === 'en-US') {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    router.push(segments.join('/'))
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search employees, contracts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative">
            <label htmlFor="language-select" className="sr-only">Idioma</label>
            <select
              id="language-select"
              aria-label="Selecionar idioma"
              value={locale}
              onChange={handleLocaleChange}
              className="appearance-none bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            >
              <option value="pt-BR">Português</option>
              <option value="en-US">English</option>
            </select>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="h-5 w-5 text-gray-600 dark:text-slate-400" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-slate-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-slate-400" />
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            </button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50"
              >
                <a
                  href="/dashboard/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </a>
                {/* Seletor de idioma com bandeiras */}
                <div className="px-4 py-2">
                  <span className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Idioma</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLocaleChange({ target: { value: 'pt-BR' } } as any)}
                      className={`flex items-center px-2 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${locale === 'pt-BR' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200'}`}
                      aria-label="Português"
                      tabIndex={0}
                    >
                      <FlagBR /> Português
                    </button>
                    <button
                      onClick={() => handleLocaleChange({ target: { value: 'en-US' } } as any)}
                      className={`flex items-center px-2 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${locale === 'en-US' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200'}`}
                      aria-label="English"
                      tabIndex={0}
                    >
                      <FlagUS /> English
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}