import React, { useEffect, useState, useCallback } from 'react';
import { products as staticProducts, categories } from '../data/products';
import axios from 'axios';
import API_BASE_URL from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ShoppingBag, Package, Clock, LogOut, Trash2, CreditCard, Plus, Minus, CheckCircle, XCircle, Pencil } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [dbProducts, setDbProducts] = useState([]);
    const [toast, setToast] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null); // order being edited
    const [productSearch, setProductSearch] = useState(''); // search inside edit modal
    const [confirmDelete, setConfirmDelete] = useState(null); // orderId pending deletion
    const [selectedProduct, setSelectedProduct] = useState(null); // full view product

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    // ... (Keep existing logic handlers)
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, change) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + change;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const placeOrder = async () => {
        try {
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const orderProducts = cart.map(item => ({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/orders`,
                { products: orderProducts, totalAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showToast('Order placed successfully! 🎉', 'success');
            setCart([]);
            fetchOrders();
            setActiveTab('orders');
        } catch (error) {
            console.error(error);
            showToast('Failed to place order. Please try again.', 'error');
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Order deleted successfully.', 'success');
            fetchOrders();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete order.';
            showToast(msg, 'error');
        } finally {
            setConfirmDelete(null);
        }
    };

    const openEditOrder = (order) => {
        // Deep-clone products so edits don't mutate state directly
        setEditingOrder({
            _id: order._id,
            products: order.products.map(p => ({ ...p })),
        });
    };

    const updateEditQty = (idx, change) => {
        setEditingOrder(prev => {
            const products = prev.products.map((p, i) => {
                if (i !== idx) return p;
                const newQty = p.quantity + change;
                return newQty > 0 ? { ...p, quantity: newQty } : p;
            });
            return { ...prev, products };
        });
    };

    const removeEditProduct = (idx) => {
        setEditingOrder(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== idx),
        }));
    };

    // Add a product from catalog to the edit order (or bump qty if already present)
    const addProductToEditOrder = (product) => {
        setEditingOrder(prev => {
            const existing = prev.products.find(p => p.productId === product.id);
            if (existing) {
                return {
                    ...prev,
                    products: prev.products.map(p =>
                        p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p
                    ),
                };
            }
            return {
                ...prev,
                products: [...prev.products, {
                    productId: product.id,
                    name: product.name,
                    quantity: 1,
                    price: product.price,
                }],
            };
        });
    };

    const saveEditOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const totalAmount = editingOrder.products.reduce((s, p) => s + p.price * p.quantity, 0);
            await axios.put(
                `${API_BASE_URL}/api/orders/${editingOrder._id}`,
                { products: editingOrder.products, totalAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Order updated successfully! ✏️', 'success');
            setEditingOrder(null);
            fetchOrders();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update order.';
            showToast(msg, 'error');
        }
    };

    useEffect(() => {
        fetchOrders();
        // Fetch DB products (public endpoint)
        axios.get(`${API_BASE_URL}/api/products`)
            .then(res => setDbProducts(res.data))
            .catch(() => { });
    }, []);

    // Merge DB products first, then static products
    const allProducts = [
        ...dbProducts.map(p => ({
            id: `db-${p._id}`,
            name: p.product_name,
            description: p.description || '',
            price: p.price,
            image: p.image_url || '',
            category: p.category,
            isNew: true
        })),
        ...staticProducts
    ];

    // Tabs Config
    const tabs = [
        { id: 'products', label: 'Shop Products', icon: ShoppingBag },
        { id: 'cart', label: `Cart (${cart.reduce((a, b) => a + b.quantity, 0)})`, icon: ShoppingBag },
        { id: 'orders', label: 'Order History', icon: Package },
    ];

    return (
        <Layout>
            {/* Toast Notification */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        top: '16px',
                        right: '16px',
                        left: window.innerWidth < 640 ? '16px' : 'auto',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        background: toast.type === 'success' ? '#1a1a2e' : '#2d1a1a',
                        color: '#fff',
                        minWidth: '0',
                        maxWidth: '420px',
                        width: window.innerWidth < 640 ? 'calc(100% - 32px)' : 'auto',
                        animation: 'slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                        borderLeft: toast.type === 'success' ? '4px solid #22c55e' : '4px solid #ef4444',
                    }}
                >
                    {toast.type === 'success'
                        ? <CheckCircle size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
                        : <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                    }
                    <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.4 }}>{toast.message}</span>
                    <button
                        onClick={() => setToast(null)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 0 0 8px' }}
                        aria-label="Close"
                    >×</button>
                </div>
            )}
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(60px) scale(0.95); }
                    to   { opacity: 1; transform: translateX(0)   scale(1); }
                }
            `}</style>
            <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                            <div className="mb-4 pb-4 border-b border-slate-100">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Logged in as</p>
                                <h2 className="font-heading font-bold text-base text-slate-900 truncate">{user?.username || 'Customer'}</h2>
                            </div>

                            <nav className="space-y-2">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-heading font-bold text-slate-900 mb-8 capitalize">
                            {activeTab === 'products' ? 'Featured Collection' : activeTab === 'cart' ? 'Your Cart' : 'My Orders'}
                        </h1>

                        {activeTab === 'products' && (
                            <div>
                                {/* Category Filter */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedCategory === 'all'
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-900'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedCategory === cat.id
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-900'
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {(selectedCategory === 'all' ? allProducts : allProducts.filter(p => p.category === selectedCategory)).map(product => (
                                        <div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
                                            <div className="h-48 overflow-hidden relative flex-shrink-0">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => { e.target.style.display='none'; e.target.parentNode.style.background='linear-gradient(135deg,#f1f5f9,#e2e8f0)'; }} />
                                            </div>
                                            <div className="p-5 flex flex-col flex-1">
                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                    <h3 className="font-heading font-semibold text-lg leading-tight line-clamp-2">{product.name}</h3>
                                                    <span className="font-bold text-slate-900 whitespace-nowrap">₹{product.price}</span>
                                                </div>
                                                <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                    className="w-full py-2.5 mt-auto rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-900 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={16} /> Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'cart' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <ShoppingBag size={24} />
                                        </div>
                                        <h3 className="text-slate-900 font-medium mb-2">Your cart is empty</h3>
                                        <p className="text-slate-500 mb-6">Looks like you haven't added anything yet.</p>
                                        <button onClick={() => setActiveTab('products')} className="btn-primary">Browse Products</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-6 mb-8">
                                            {cart.map(item => (
                                                <div key={item.id} className="flex items-center gap-6 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-slate-100" />
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-slate-900">{item.name}</h3>
                                                        <p className="text-slate-500 text-sm">₹{item.price} per item</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-md hover:bg-slate-100"><Minus size={16} /></button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-md hover:bg-slate-100"><Plus size={16} /></button>
                                                    </div>
                                                    <div className="text-right min-w-[100px]">
                                                        <p className="font-bold text-slate-900">₹{item.price * item.quantity}</p>
                                                        <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:underline mt-1 flex items-center justify-end gap-1 ml-auto">
                                                            <Trash2 size={12} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="text-slate-500 text-sm">
                                                Total Items: {cart.reduce((a, b) => a + b.quantity, 0)}
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <span className="block text-slate-500 text-sm">Total Amount</span>
                                                    <span className="block text-3xl font-heading font-bold text-slate-900">
                                                        ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <button onClick={placeOrder} className="btn-primary py-3 px-8 flex items-center gap-2 text-lg shadow-lg shadow-blue-900/10">
                                                    <CreditCard size={20} /> Checkout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                {orders.filter(o => o.status !== 'deleted').length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                                        <p className="text-slate-500">No orders placed yet.</p>
                                    </div>
                                ) : (
                                    orders.filter(o => o.status !== 'deleted').map(order => (
                                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center pb-4 border-b border-slate-50 mb-4 gap-4">
                                                <div>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                                                    <p className="font-mono text-sm text-slate-700">#{order._id}</p>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</span>
                                                        <div className="flex items-center gap-1 text-sm text-slate-700">
                                                            <Clock size={14} />
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                                                        <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 mt-1 ${
                                                            order.status === 'approved' ? 'bg-green-100 text-green-700'
                                                            : order.status === 'rejected' ? 'bg-red-100 text-red-700'
                                                            : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                                order.status === 'approved' ? 'bg-green-500'
                                                                : order.status === 'rejected' ? 'bg-red-500'
                                                                : 'bg-orange-500'
                                                            }`}></span>
                                                            {order.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                {order.products.map((p, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-slate-600">{p.name} <span className="text-slate-400">x{p.quantity}</span></span>
                                                        <span className="font-medium text-slate-900">₹{p.price * p.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2">
                                                    {order.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => openEditOrder(order)}
                                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                                                            >
                                                                <Pencil size={12} /> Edit Order
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDelete(order._id)}
                                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                                                            >
                                                                <Trash2 size={12} /> Delete Order
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                <span className="text-lg font-bold text-slate-900">Total: ₹{order.totalAmount}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* ── Edit Order Modal ── */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setEditingOrder(null); setProductSearch(''); }}>
                    <div className="modal-sheet bg-white rounded-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-heading font-bold text-lg">Edit Order</h3>
                                <p className="text-slate-400 text-xs font-mono">#{editingOrder._id}</p>
                            </div>
                            <button onClick={() => setEditingOrder(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                <XCircle size={18} />
                            </button>
                        </div>

                        {/* Current Order Items */}
                        <div className="px-6 pt-4 pb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Items</p>
                            {editingOrder.products.length === 0 ? (
                                <p className="text-sm text-slate-400 italic py-2">No items — add products below.</p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {editingOrder.products.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-white">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 text-sm truncate">{p.name}</p>
                                                <p className="text-xs text-slate-400">₹{p.price} / item</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => updateEditQty(idx, -1)} className="p-1 rounded-md hover:bg-slate-100 transition-colors">
                                                    <Minus size={13} />
                                                </button>
                                                <span className="w-7 text-center font-bold text-sm">{p.quantity}</span>
                                                <button onClick={() => updateEditQty(idx, 1)} className="p-1 rounded-md hover:bg-slate-100 transition-colors">
                                                    <Plus size={13} />
                                                </button>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 min-w-[56px] text-right">
                                                ₹{(p.price * p.quantity).toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => removeEditProduct(idx)}
                                                title="Remove item"
                                                className="p-1 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
                                            >
                                                <XCircle size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add Products from Catalog */}
                        <div className="px-6 pb-4 border-t border-dashed border-slate-200 pt-3 mt-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Plus size={12} /> Add Products
                            </p>
                            <input
                                type="text"
                                placeholder="Search products…"
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            />
                            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                                {allProducts
                                    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                    .map(product => (
                                        <div key={product.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 text-sm truncate">{product.name}</p>
                                                <p className="text-xs text-slate-400">₹{product.price}</p>
                                            </div>
                                            <button
                                                onClick={() => addProductToEditOrder(product)}
                                                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
                                            >
                                                <Plus size={12} /> Add
                                            </button>
                                        </div>
                                    ))
                                }
                                {allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                    <p className="text-sm text-slate-400 text-center py-2 italic">No products found.</p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                            <span className="text-lg font-heading font-bold text-slate-900">
                                Total: ₹{editingOrder.products.reduce((s, p) => s + p.price * p.quantity, 0).toLocaleString()}
                            </span>
                            <div className="flex gap-3">
                                <button onClick={() => { setEditingOrder(null); setProductSearch(''); }} className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={saveEditOrder} className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                                    <Pencil size={14} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {confirmDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setConfirmDelete(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-red-600 text-white px-6 py-4 flex items-center gap-3">
                            <Trash2 size={20} />
                            <h3 className="font-heading font-bold text-lg">Delete Order</h3>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-6">
                            <p className="text-slate-700 text-sm leading-relaxed">
                                Are you sure you want to delete this order? This action cannot be undone.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-5 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteOrder(confirmDelete)}
                                className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Product Details Modal ── */}
            {selectedProduct && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col md:flex-row my-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close button - absolute for styling */}
                        <button 
                            onClick={() => setSelectedProduct(null)} 
                            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white backdrop-blur rounded-full text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
                        >
                            <XCircle size={24} />
                        </button>

                        <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-50 relative">
                            <img 
                                src={selectedProduct.image} 
                                alt={selectedProduct.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => { e.target.style.display='none'; e.target.parentNode.style.background='linear-gradient(135deg,#f1f5f9,#e2e8f0)'; }} 
                            />
                        </div>

                        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-white">
                            <div className="mb-2">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                                    {categories.find(c => c.id === selectedProduct.category)?.name || selectedProduct.category}
                                </span>
                            </div>
                            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">{selectedProduct.name}</h2>
                            <div className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                                ₹{selectedProduct.price}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-2 mb-6 max-h-48 md:max-h-64 scrollbar-thin scrollbar-thumb-slate-200">
                                <h4 className="text-sm font-bold text-slate-900 mb-2">Description</h4>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                    {selectedProduct.description || 'No description available for this product.'}
                                </p>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100 mt-auto">
                                <button
                                    onClick={() => {
                                        addToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={18} /> Add to Cart — ₹{selectedProduct.price}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Dashboard;
