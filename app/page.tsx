'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Shield, Users, Clock, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PlanningControl</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Funcionalidades</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Preços</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contato</a>
              <Link 
                href="/login" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Entrar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestão Completa de Efetivo
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Plataforma multi-tenant completa para gestão de workforce e operações com controle avançado de funcionários, contratos e segurança.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard" 
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-2 justify-center"
              >
                Começar Teste Gratuito
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/login" 
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 justify-center"
              >
                Ver Demonstração
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tudo que Você Precisa</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece todas as ferramentas necessárias para gerenciar seu efetivo de forma eficaz
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Gestão de Funcionários",
                description: "Gerenciamento completo do ciclo de vida dos funcionários com busca avançada e capacidades de filtragem."
              },
              {
                icon: Building2,
                title: "Gestão de Contratos", 
                description: "Gerencie múltiplos contratos com diferentes funções, horários e requisitos."
              },
              {
                icon: Shield,
                title: "Segurança e Compliance",
                description: "Acompanhe ASOs, requisitos de treinamento e mantenha registros completos de conformidade de segurança."
              },
              {
                icon: Clock,
                title: "Controle de Ponto",
                description: "Coleta de tempo baseada em NFC com suporte offline e sincronização automatizada."
              },
              {
                icon: BarChart3,
                title: "Análises Avançadas",
                description: "Dashboards abrangentes e relatórios para tomada de decisões baseada em dados."
              },
              {
                icon: Building2,
                title: "Multi-Tenant e White Label",
                description: "Ambientes isolados para cada cliente com personalização completa de marca."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Por que Escolher o PlanningControl?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Construído para performance empresarial com a flexibilidade que você precisa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "99.9% Uptime", description: "Confiabilidade de nível empresarial" },
              { title: "Multi-Tenant", description: "Ambientes seguros e isolados" },
              { title: "White Label", description: "Personalização completa de marca" },
              { title: "Suporte 24/7", description: "Sempre aqui para ajudar" }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-blue-100">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Pronto para Transformar sua Gestão de Efetivo?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Junte-se a milhares de empresas que já usam o PlanningControl para otimizar suas operações.
            </p>
            <Link 
              href="/dashboard" 
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              Comece Hoje Mesmo
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">PlanningControl</span>
              </div>
              <p className="text-gray-600">
                A plataforma completa de gestão de efetivo para empresas modernas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-blue-600">Preços</a></li>
                <li><a href="#" className="hover:text-blue-600">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Sobre</a></li>
                <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-blue-600">Contato</a></li>
                <li><a href="#" className="hover:text-blue-600">Documentação da API</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
            <p>&copy; 2025 PlanningControl. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}