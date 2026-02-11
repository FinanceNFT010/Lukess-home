'use client'
import { useState } from 'react'
import { ChevronDown, X, DollarSign, Tag, Palette, Ruler, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Filters {
  priceRange: [number, number]
  brands: string[]
  colors: string[]
  sizes: string[]
  inStock: boolean | null
  category: string | null
  hasDiscount?: boolean | null
}

interface FilterSidebarProps {
  onFilterChange: (filters: Filters) => void
  brands: string[]
  colors: string[]
  categories: string[]
}

export function FilterSidebar({ onFilterChange, brands, colors, categories }: FilterSidebarProps) {
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 1000],
    brands: [],
    colors: [],
    sizes: [],
    inStock: null,
    category: null,
    hasDiscount: null,
  })
  
  const [openSections, setOpenSections] = useState({
    price: true,
    brand: true,
    color: true,
    size: true,
    stock: true,
    category: true,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateFilters = (newFilters: Partial<Filters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange(updated)
  }

  const clearAllFilters = () => {
    const emptyFilters: Filters = {
      priceRange: [0, 1000],
      brands: [],
      colors: [],
      sizes: [],
      inStock: null,
      category: null,
      hasDiscount: null,
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const activeFiltersCount = 
    filters.brands.length +
    filters.colors.length +
    filters.sizes.length +
    (filters.inStock !== null ? 1 : 0) +
    (filters.category !== null ? 1 : 0) +
    (filters.hasDiscount !== null ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0)

  return (
    <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h3 className="font-bold text-lg text-gray-900">Filtros</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
          >
            <X className="w-4 h-4" />
            Limpiar ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Categoría */}
      <FilterSection
        title="Categoría"
        icon={<Tag className="w-4 h-4" />}
        isOpen={openSections.category}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat}
                onChange={() => updateFilters({ category: cat === filters.category ? null : cat })}
                className="w-4 h-4 accent-primary-600"
              />
              <span className="text-sm group-hover:text-primary-600 transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Precio */}
      <FilterSection
        title="Precio"
        icon={<DollarSign className="w-4 h-4" />}
        isOpen={openSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) => updateFilters({ priceRange: [+e.target.value, filters.priceRange[1]] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary-600 focus:outline-none"
              placeholder="Mín"
              min="0"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilters({ priceRange: [filters.priceRange[0], +e.target.value] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary-600 focus:outline-none"
              placeholder="Máx"
              min="0"
            />
          </div>
          
          {/* Rangos predefinidos */}
          <div className="flex flex-wrap gap-2">
            {[
              [0, 100],
              [100, 200],
              [200, 300],
              [300, 1000],
            ].map(([min, max]) => (
              <button
                key={`${min}-${max}`}
                onClick={() => updateFilters({ priceRange: [min, max] })}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  filters.priceRange[0] === min && filters.priceRange[1] === max
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 hover:border-primary-600 hover:text-primary-600'
                }`}
              >
                Bs {min}-{max}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Marca */}
      <FilterSection
        title="Marca"
        icon={<Tag className="w-4 h-4" />}
        isOpen={openSections.brand}
        onToggle={() => toggleSection('brand')}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={(e) => {
                  const newBrands = e.target.checked
                    ? [...filters.brands, brand]
                    : filters.brands.filter(b => b !== brand)
                  updateFilters({ brands: newBrands })
                }}
                className="w-4 h-4 accent-primary-600"
              />
              <span className="text-sm group-hover:text-primary-600 transition-colors">{brand}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection
        title="Color"
        icon={<Palette className="w-4 h-4" />}
        isOpen={openSections.color}
        onToggle={() => toggleSection('color')}
      >
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                const newColors = filters.colors.includes(color)
                  ? filters.colors.filter(c => c !== color)
                  : [...filters.colors, color]
                updateFilters({ colors: newColors })
              }}
              className={`px-3 py-1.5 text-xs rounded-full border-2 transition-all ${
                filters.colors.includes(color)
                  ? 'border-primary-600 bg-primary-50 text-primary-600 font-semibold'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Talla */}
      <FilterSection
        title="Talla"
        icon={<Ruler className="w-4 h-4" />}
        isOpen={openSections.size}
        onToggle={() => toggleSection('size')}
      >
        <div className="grid grid-cols-3 gap-2">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
            <button
              key={size}
              onClick={() => {
                const newSizes = filters.sizes.includes(size)
                  ? filters.sizes.filter(s => s !== size)
                  : [...filters.sizes, size]
                updateFilters({ sizes: newSizes })
              }}
              className={`py-2 text-sm font-semibold rounded-lg border-2 transition-all ${
                filters.sizes.includes(size)
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Disponibilidad */}
      <FilterSection
        title="Disponibilidad"
        icon={<Package className="w-4 h-4" />}
        isOpen={openSections.stock}
        onToggle={() => toggleSection('stock')}
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.inStock === true}
              onChange={(e) => updateFilters({ inStock: e.target.checked ? true : null })}
              className="w-4 h-4 accent-primary-600"
            />
            <span className="text-sm group-hover:text-primary-600 transition-colors">Solo productos en stock</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.hasDiscount === true}
              onChange={(e) => updateFilters({ hasDiscount: e.target.checked ? true : null })}
              className="w-4 h-4 accent-red-600"
            />
            <span className="text-sm group-hover:text-red-600 transition-colors">Solo con descuento</span>
          </label>
        </div>
      </FilterSection>
    </div>
  )
}

// Componente auxiliar para secciones colapsables
interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, icon, isOpen, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary-600">{icon}</span>
          <h4 className="font-semibold text-sm text-gray-900 group-hover:text-primary-600 transition-colors">{title}</h4>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
