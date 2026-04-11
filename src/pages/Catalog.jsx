import React, { useState, useMemo } from 'react'
import Navbar from '../components/NavBar'
import SearchBar from '../components/SearchBar'
import FiltersSidebar from '../components/FiltersSidebar'
import CatalogProductCard from '../components/CatalogProductCard'
import { PRODUCTS_DATA } from '../data/products'

const Catalog = ({ onSelectProduct, onOpenLogin, currentUser, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    categories: {
      todos: true,
      redondos: false,
      rectangulares: false,
      dePiso: false,
      modernos: false,
    },
    sizes: {
      pequeno: false,
      mediano: false,
      grande: false,
    },
  })
  const [sortBy, setSortBy] = useState('relevantes')

  // Función para filtrar productos
  const filteredProducts = useMemo(() => {
    let filtered = [...PRODUCTS_DATA]

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por categorías
    const activeCategories = Object.entries(filters.categories)
      .filter(([key, value]) => value && key !== 'todos')
      .map(([key]) => key)

    if (activeCategories.length > 0) {
      filtered = filtered.filter((product) =>
        activeCategories.includes(product.category),
      )
    }

    // Filtro por tamaños
    const activeSizes = Object.entries(filters.sizes)
      .filter(([, value]) => value)
      .map(([key]) => key)

    if (activeSizes.length > 0) {
      filtered = filtered.filter((product) => activeSizes.includes(product.size))
    }

    // Ordenamiento
    if (sortBy === 'precio-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'precio-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'nombre') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }
    // 'relevantes' mantiene el orden original

    return filtered
  }, [searchTerm, filters, sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onOpenLogin={onOpenLogin} currentUser={currentUser} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <SearchBar onSearch={setSearchTerm} />

        <div className="flex gap-6 mt-6">
          {/* Sidebar de filtros */}
          <FiltersSidebar onFilterChange={setFilters} />

          {/* Área principal de productos */}
          <div className="flex-1">
            {/* Header con contador y ordenamiento */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-600">
                Mostrando {filteredProducts.length} productos
              </p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                >
                  <option value="relevantes">Más relevantes</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                  <option value="nombre">Nombre A-Z</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  product={product}
                  onView={() => onSelectProduct?.(product.id)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">
                  No se encontraron productos con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Catalog
