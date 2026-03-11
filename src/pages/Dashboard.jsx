import React, { useEffect, useState } from 'react';
import { products as staticProducts, categories } from '../data/products';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ShoppingBag, Package, Clock, LogOut, Trash2, CreditCard, Plus, Minus } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [dbProducts, setDbProducts] = useState([]);

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
            await axios.post('http://localhost:5000/api/orders',
                { products: orderProducts, totalAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Order placed successfully!');
            setCart([]);
            fetchOrders();
            setActiveTab('orders');
        } catch (error) {
            console.error(error);
            alert('Failed to place order');
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Fetch DB products (public endpoint)
        axios.get('http://localhost:5000/api/products')
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
            <div className="container mx-auto px-6 py-10">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(selectedCategory === 'all' ? allProducts : allProducts.filter(p => p.category === selectedCategory)).map(product => (
                                        <div key={product.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                            <div className="h-48 overflow-hidden relative">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            </div>
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-heading font-semibold text-lg">{product.name}</h3>
                                                    <span className="font-bold text-slate-900">₹{product.price}</span>
                                                </div>
                                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-900 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2"
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
                                {orders.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                                        <p className="text-slate-500">No orders placed yet.</p>
                                    </div>
                                ) : (
                                    orders.map(order => (
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
                                                        <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 mt-1 ${order.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'approved' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
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

                                            <div className="flex justify-end pt-2">
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
        </Layout>
    );
};

export default Dashboard;
