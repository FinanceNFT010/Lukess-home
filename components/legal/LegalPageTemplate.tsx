import Container from '@/components/ui/Container'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface LegalPageTemplateProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalPageTemplate({ title, lastUpdated, children }: LegalPageTemplateProps) {
  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <Container>
        {/* Breadcrumb */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-800 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
            Última actualización: {lastUpdated}
          </p>
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
            {children}
          </div>
        </div>
      </Container>
    </div>
  )
}
