import React, { useState } from 'react';

const FiltersSidebar = ({ onFilterChange }) => {
  const [categories, setCategories] = useState({
    todos: true,
    redondos: false,
    rectangulares: false,
    dePiso: false,
    modernos: false,
  });

  const [sizes, setSizes] = useState({
    pequeno: false,
    mediano: false,
    grande: false,
  });

  const handleCategoryChange = (category) => {
    if (category === 'todos') {
      const newCategories = {
        todos: true,
        redondos: false,
        rectangulares: false,
        dePiso: false,
        modernos: false,
      };
      setCategories(newCategories);
      if (onFilterChange) {
        onFilterChange({ categories: newCategories, sizes });
      }
    } else {
      const newCategories = {
        ...categories,
        todos: false,
        [category]: !categories[category],
      };
      setCategories(newCategories);
      if (onFilterChange) {
        onFilterChange({ categories: newCategories, sizes });
      }
    }
  };

  const handleSizeChange = (size) => {
    const newSizes = {
      ...sizes,
      [size]: !sizes[size],
    };
    setSizes(newSizes);
    if (onFilterChange) {
      onFilterChange({ categories, sizes: newSizes });
    }
  };

  const handleClearFilters = () => {
    const clearedCategories = {
      todos: true,
      redondos: false,
      rectangulares: false,
      dePiso: false,
      modernos: false,
    };
    const clearedSizes = {
      pequeno: false,
      mediano: false,
      grande: false,
    };
    setCategories(clearedCategories);
    setSizes(clearedSizes);
    if (onFilterChange) {
      onFilterChange({ categories: clearedCategories, sizes: clearedSizes });
    }
  };

  return (
    <aside className="w-64 pr-6">
      <div className="bg-white rounded-lg p-6 sticky top-24">
        <h2 className="font-bold text-lg text-slate-800 mb-6">Filtros</h2>

        {/* Categorías */}
        <div className="mb-8">
          <h3 className="font-semibold text-slate-700 mb-4">Categorías</h3>
          <div className="space-y-3">
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'redondos', label: 'Redondos' },
              { key: 'rectangulares', label: 'Rectangulares' },
              { key: 'dePiso', label: 'De Piso' },
              { key: 'modernos', label: 'Modernos' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={categories[key]}
                  onChange={() => handleCategoryChange(key)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-3 text-slate-600 group-hover:text-slate-800">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Tamaño */}
        <div className="mb-8">
          <h3 className="font-semibold text-slate-700 mb-4">Tamaño</h3>
          <div className="space-y-3">
            {[
              { key: 'pequeno', label: 'Pequeño (hasta 50cm)' },
              { key: 'mediano', label: 'Mediano (50-100cm)' },
              { key: 'grande', label: 'Grande (100cm+)' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={sizes[key]}
                  onChange={() => handleSizeChange(key)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-3 text-slate-600 group-hover:text-slate-800">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Botón Limpiar filtros */}
        <button
          onClick={handleClearFilters}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg text-slate-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </aside>
  );
};

export default FiltersSidebar;
