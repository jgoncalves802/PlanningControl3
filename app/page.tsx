'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Shield, 
  Users, 
  Clock, 
  BarChart3, 
  ArrowRight, 
  CheckCircle, 
  ArrowUpRight,
  Zap,
  Target,
  TrendingUp,
  Award,
  Globe,
  Lock,
  Smartphone,
  Database,
  Cloud,
  Settings,
  FileText,
  Calendar,
  MapPin,
  UserCheck,
  CreditCard,
  Headphones,
  Star,
  ChevronRight,
  Play,
  Monitor,
  Smartphone as Mobile,
  Tablet
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                PlanningControl
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Funcionalidades</a>
              <a href="#modules" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Módulos</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Preços</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Contato</a>
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Entrar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5"></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Star className="h-4 w-4" />
              Plataforma Multi-Tenant Completa
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Gestão Inteligente de{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Workforce
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Plataforma completa para gestão de efetivo, contratos, transferências e controle de ponto com NFC. 
              Multi-tenant, white label e com analytics avançados para otimizar suas operações.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link 
                href="/dashboard" 
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center gap-3 justify-center shadow-xl"
              >
                Começar Teste Gratuito
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="group border-2 border-gray-300 text-gray-700 px-10 py-4 rounded-2xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-3 justify-center bg-white/50 backdrop-blur-sm"
              >
                <Play className="h-5 w-5" />
                Ver Demonstração
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { number: "10K+", label: "Funcionários Ativos" },
                { number: "500+", label: "Contratos Gerenciados" },
                { number: "99.9%", label: "Uptime Garantido" },
                { number: "24/7", label: "Suporte Técnico" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Funcionalidades Principais
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Tudo que Você Precisa</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nossa plataforma oferece todas as ferramentas necessárias para gerenciar seu efetivo de forma eficaz e moderna
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Gestão de Funcionários",
                description: "Gerenciamento completo do ciclo de vida dos funcionários com busca avançada, filtros e histórico completo.",
                features: ["Cadastro completo", "Histórico de carreira", "Busca avançada", "Importação em massa"]
              },
              {
                icon: Building2,
                title: "Gestão de Contratos", 
                description: "Gerencie múltiplos contratos com diferentes funções, horários e requisitos específicos.",
                features: ["Multi-contratos", "Funções personalizadas", "Gestão de horários", "Compliance"]
              },
              {
                icon: ArrowUpRight,
                title: "Sistema de Transferências",
                description: "Controle completo de transferências entre contratos com aprovações e timestamps.",
                features: ["Workflow de aprovação", "Timestamps automáticos", "Métricas de tempo", "Histórico completo"]
              },
              {
                icon: Clock,
                title: "Controle de Ponto NFC",
                description: "Sistema de ponto baseado em NFC com suporte offline e sincronização automatizada.",
                features: ["Leitura NFC", "Modo offline", "Sincronização automática", "Relatórios"]
              },
              {
                icon: Shield,
                title: "Segurança e Compliance",
                description: "Acompanhe ASOs, requisitos de treinamento e mantenha registros de conformidade.",
                features: ["Gestão de ASOs", "Treinamentos", "Compliance", "Auditoria"]
              },
              {
                icon: BarChart3,
                title: "Analytics Avançados",
                description: "Dashboards abrangentes e relatórios para tomada de decisões baseada em dados.",
                features: ["Dashboards em tempo real", "Relatórios customizados", "Métricas de performance", "Exportação"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Settings className="h-4 w-4" />
              Módulos Especializados
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Módulos Integrados</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Cada módulo foi desenvolvido para atender necessidades específicas da gestão de workforce
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {[
              {
                title: "Gestão de Funcionários",
                description: "Módulo completo para gestão do ciclo de vida dos funcionários",
                icon: Users,
                features: [
                  "Cadastro e edição de funcionários",
                  "Histórico de carreira completo",
                  "Gestão de funções e contratos",
                  "Importação em massa via CSV",
                  "Busca e filtros avançados",
                  "Gestão de documentos"
                ],
                color: "blue"
              },
              {
                title: "Sistema de Transferências",
                description: "Controle completo de transferências entre contratos",
                icon: ArrowUpRight,
                features: [
                  "Workflow de aprovação configurável",
                  "Timestamps automáticos",
                  "Métricas de tempo de processo",
                  "Histórico de transferências",
                  "Notificações em tempo real",
                  "Relatórios de performance"
                ],
                color: "green"
              },
              {
                title: "Controle de Ponto NFC",
                description: "Sistema moderno de controle de ponto com tecnologia NFC",
                icon: Smartphone,
                features: [
                  "Leitura de crachás NFC",
                  "Funcionamento offline",
                  "Sincronização automática",
                  "Relatórios de ponto",
                  "Gestão de horários",
                  "Integração com sistemas"
                ],
                color: "purple"
              },
              {
                title: "Analytics e Relatórios",
                description: "Dashboards e relatórios para tomada de decisões",
                icon: BarChart3,
                features: [
                  "Dashboards em tempo real",
                  "Métricas de performance",
                  "Relatórios customizáveis",
                  "Exportação de dados",
                  "Alertas inteligentes",
                  "Análise preditiva"
                ],
                color: "orange"
              }
            ].map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                  module.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  module.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  module.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  'bg-gradient-to-br from-orange-500 to-orange-600'
                }`}>
                  <module.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{module.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{module.description}</p>
                <ul className="space-y-3">
                  {module.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="h-4 w-4" />
              Por que Escolher o PlanningControl?
            </div>
            <h2 className="text-5xl font-bold mb-6">Construído para Performance</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Plataforma multi-tenant com a flexibilidade e confiabilidade que sua empresa precisa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Globe, 
                title: "Multi-Tenant", 
                description: "Ambientes seguros e isolados para cada cliente",
                detail: "Cada cliente tem seu próprio ambiente isolado e seguro"
              },
              { 
                icon: Lock, 
                title: "Segurança Avançada", 
                description: "Proteção de dados de nível empresarial",
                detail: "Criptografia, backups automáticos e compliance"
              },
              { 
                icon: Zap, 
                title: "Performance", 
                description: "99.9% de uptime garantido",
                detail: "Infraestrutura escalável e otimizada"
              },
              { 
                icon: Headphones, 
                title: "Suporte 24/7", 
                description: "Sempre aqui para ajudar",
                detail: "Equipe técnica especializada disponível 24/7"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-blue-100 mb-2">{benefit.description}</p>
                <p className="text-sm text-blue-200">{benefit.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Tecnologia Moderna
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Tecnologia de Ponta</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Construído com as melhores tecnologias para garantir performance e escalabilidade
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
                title: "Banco de Dados",
                description: "PostgreSQL com Prisma ORM para máxima performance e segurança"
              },
              {
                icon: Cloud,
                title: "Cloud Native",
                description: "Arquitetura cloud-native com Supabase para escalabilidade"
              },
              {
                icon: Smartphone,
                title: "NFC Technology",
                description: "Tecnologia NFC moderna para controle de ponto preciso"
              }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <tech.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{tech.title}</h3>
                <p className="text-gray-600 leading-relaxed">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Target className="h-4 w-4" />
              Pronto para Começar?
            </div>
            <h2 className="text-5xl font-bold mb-6">Transforme sua Gestão de Workforce</h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Junte-se a milhares de empresas que já usam o PlanningControl para otimizar suas operações e aumentar a produtividade.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/dashboard" 
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 inline-flex items-center gap-3 shadow-xl"
              >
                Comece Hoje Mesmo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="group border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-semibold hover:bg-white hover:text-gray-900 transition-all inline-flex items-center gap-3"
              >
                <Play className="h-5 w-5" />
                Ver Demonstração
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">PlanningControl</span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                A plataforma completa de gestão de workforce para empresas modernas. Multi-tenant, segura e escalável.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-6">Produto</h3>
              <ul className="space-y-4 text-gray-600">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</a></li>
                <li><a href="#modules" className="hover:text-blue-600 transition-colors">Módulos</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Segurança</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-6">Empresa</h3>
              <ul className="space-y-4 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Imprensa</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Parceiros</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-6">Suporte</h3>
              <ul className="space-y-4 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Comunidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">&copy; 2025 PlanningControl. Todos os direitos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Privacidade</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Termos</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}