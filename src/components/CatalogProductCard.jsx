import React from 'react'

const CatalogProductCard = ({ product, onView }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <article className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Imagen del producto */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.shape === 'round' ? (
          <div
            className={`w-24 h-24 rounded-full ${product.color || 'bg-yellow-400'}`}
            style={{ backgroundColor: product.colorHex }}
          />
        ) : product.shape === 'square' ? (
          <div
            className={`w-24 h-24 rounded-lg ${product.color || 'bg-gray-300'}`}
            style={{ backgroundColor: product.colorHex }}
          />
        ) : (
          <div
            className={`w-32 h-24 rounded ${product.color || 'bg-gray-800'}`}
            style={{ backgroundColor: product.colorHex }}
          />
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-800 mb-2 text-sm">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-slate-900 mb-4">
          {formatPrice(product.price)}
        </p>
        <button
          type="button"
          onClick={onView}
          className={`mt-auto py-2 px-4 rounded-lg font-medium transition-colors ${
            product.featured
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
          }`}
        >
          Ver más
        </button>
      </div>
    </article>
  )
}

export default CatalogProductCard
