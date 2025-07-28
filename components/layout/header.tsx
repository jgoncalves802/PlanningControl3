'use client'

import { useState, useEffect } from 'react'
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
  const [locale, setLocale] = useState('pt-BR')
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

    // Load saved locale preference
    const savedLocale = localStorage.getItem('locale') || 'pt-BR'
    setLocale(savedLocale)
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

  // Função para trocar idioma
  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
    // Em um app real, aqui você recarregaria as mensagens ou faria o redirect
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
              placeholder="Buscar funcionários, contratos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <div className="relative">
              <select
                value={locale}
                onChange={handleLocaleChange}
                className="appearance-none bg-transparent border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="pt-BR">PT-BR</option>
                <option value="en-US">EN-US</option>
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {locale === 'pt-BR' ? <FlagBR /> : <FlagUS />}
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {user?.email || 'usuario@exemplo.com'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
