'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Shield, Users, Clock, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          PlanningControl
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sistema funcionando corretamente!
        </p>
        <a 
          href="/login" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Ir para Login
        </a>
      </div>
    </div>
  )
}