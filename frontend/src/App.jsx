import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package, DollarSign, Box, X, Check, AlertCircle } from 'lucide-react';
import SpotlightCard from './components/SpotlightCard';
import BlurText from './components/BlurText';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products. Make sure your API is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      if (editingProduct) {
        await fetch(`${API_BASE_URL}/product?id=${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      } else {
        await fetch(`${API_BASE_URL}/product`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      }
      
      fetchProducts();
      closeModal();
    } catch (err) {
      setError('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`${API_BASE_URL}/product?id=${id}`, {
          method: 'DELETE'
        });
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        quantity: product.quantity.toString()
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', quantity: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', quantity: '' });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFormValid = formData.name && formData.description && formData.price && formData.quantity;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-blue-950 to-slate-950 ">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50" />
                <div className="relative w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <BlurText 
                  text="Product Management Dashboard" 
                  delay={100}
                  className="text-3xl font-bold text-white"
                />
                <p className="text-sm text-slate-400 mt-1">Configure your products inventory</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-14 pr-6 py-4 bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 transition-all duration-300 shadow-lg text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <SpotlightCard 
                key={product.id}
                className="p-6 hover:scale-[1.02] transition-transform duration-300"
                spotlightColor="rgba(96, 165, 250, 0.3)"
              >
                <div className="relative h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white line-clamp-1">
                      {product.name}
                    </h3>
                    <span className="px-3 py-1 bg-linear-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full shrink-0">
                      #{product.id}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-6 line-clamp-2 leading-relaxed grow">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center gap-6 mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shrink-0">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Price</div>
                        <div className="text-xl font-bold text-white">${product.price}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <Box className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Stock</div>
                        <div className="text-xl font-bold text-white">{product.quantity}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openModal(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 backdrop-blur-sm text-red-400 rounded-xl font-semibold border border-red-500/20 hover:bg-red-500/20 transition-all hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-24 h-24 bg-linear-to-br from-slate-700 to-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No products found</h3>
            <p className="text-slate-400 text-lg">Try adjusting your search or add a new product</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-white/10 bg-linear-to-r from-blue-500/10 to-purple-600/10 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-white placeholder-slate-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-all resize-none text-white placeholder-slate-500"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-white placeholder-slate-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-white placeholder-slate-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}