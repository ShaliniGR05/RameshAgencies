import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { categories } from '../data/products';
import { Users, Package, Check, Clock, UserCheck, Eye, X, ShoppingBag, Plus, Trash2, Filter, Pencil, XCircle } from 'lucide-react';

const convertDriveUrl = (url) => {
    if (!url) return url;
    // Match: https://drive.google.com/file/d/<ID>/view...
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/\?&]+)/);
    if (fileMatch) return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w400`;
    // Match: /open?id=<ID>
    const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
    if (openMatch) return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w400`;
    // Also convert legacy saved uc?id= format
    const legacyUcMatch = url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/);
    if (legacyUcMatch) return `https://drive.google.com/thumbnail?id=${legacyUcMatch[1]}&sz=w400`;
    return url;
};

const AdminDashboard = () => {
    // ... (Keep existing logic)
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Confirmation Modals State
    const [productToDelete, setProductToDelete] = useState(null);
    const [userToReject, setUserToReject] = useState(null);
    const [orderToReject, setOrderToReject] = useState(null);

    // Products state
    const [allProducts, setAllProducts] = useState([]);
    const [filterCategory, setFilterCategory] = useState('all');
    const [productMsg, setProductMsg] = useState({ text: '', type: '' });
    const [newProduct, setNewProduct] = useState({
        product_name: '', description: '', image_url: '', price: '', category: categories[0]?.id || ''
    });

    // Edit modal state
    const [editingProduct, setEditingProduct] = useState(null);
    const [editMsg, setEditMsg] = useState({ text: '', type: '' });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchPendingUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/auth/all-users`, config);
            setPendingUsers(res.data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const fetchAllOrders = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/orders`, config);
            setAllOrders(res.data);
        } catch (error) {
            console.error('Error fetching orders', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products`, config);
            setAllProducts(res.data);
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    const addProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/products`, {
                ...newProduct,
                price: parseFloat(newProduct.price)
            }, config);
            setNewProduct({ product_name: '', description: '', image_url: '', price: '', category: categories[0]?.id || '' });
            setProductMsg({ text: 'Product added successfully!', type: 'success' });
            fetchProducts();
            setTimeout(() => setProductMsg({ text: '', type: '' }), 3000);
        } catch (error) {
            setProductMsg({ text: 'Failed to add product.', type: 'error' });
        }
    };

    const deleteProduct = (id) => {
        setProductToDelete(id);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/products/${productToDelete}`, config);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product', error);
        } finally {
            setProductToDelete(null);
        }
    };

    const openEdit = (product) => {
        setEditingProduct({
            _id: product._id,
            product_name: product.product_name,
            description: product.description || '',
            image_url: product.image_url || '',
            price: product.price,
            category: product.category,
        });
        setEditMsg({ text: '', type: '' });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${API_BASE_URL}/api/products/${editingProduct._id}`,
                { ...editingProduct, price: parseFloat(editingProduct.price) },
                config
            );
            setEditMsg({ text: 'Product updated!', type: 'success' });
            fetchProducts();
            setTimeout(() => setEditingProduct(null), 1200);
        } catch (error) {
            setEditMsg({ text: 'Failed to update product.', type: 'error' });
        }
    };

    const approveUser = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/api/auth/approve-user/${id}`, {}, config);
            fetchPendingUsers();
        } catch (error) {
            console.error('Error approving user', error);
        }
    };

    const rejectUser = (id) => {
        setUserToReject(id);
    };

    const confirmRejectUser = async () => {
        if (!userToReject) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/auth/reject-user/${userToReject}`, config);
            fetchPendingUsers();
        } catch (error) {
            console.error('Error rejecting user', error);
        } finally {
            setUserToReject(null);
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await axios.put(`${API_BASE_URL}/api/orders/${id}/status`, { status }, config);
            fetchAllOrders();
        } catch (error) {
            console.error('Error updating order status', error);
        }
    };

    const confirmRejectOrder = async () => {
        if (!orderToReject) return;
        try {
            await updateOrderStatus(orderToReject, 'rejected');
        } finally {
            setOrderToReject(null);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
        fetchAllOrders();
        fetchProducts();
    }, []);

    const filteredProducts = filterCategory === 'all'
        ? allProducts
        : allProducts.filter(p => p.category === filterCategory);

    const tabs = [
        { id: 'users', label: 'User Approvals', icon: Users, count: pendingUsers.length },
        { id: 'orders', label: 'Order Management', icon: Package, count: allOrders.length },
        { id: 'products', label: 'Products', icon: ShoppingBag, count: allProducts.length },
    ];

    return (
        <Layout>
            <div className="bg-slate-900 text-white py-8 sm:py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-1 sm:mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400 text-sm sm:text-base">Manage user access and oversee order fulfillment.</p>
                </div>
            </div>

            <div className="container mx-auto px-3 sm:px-6 -mt-6 sm:-mt-8">
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden min-h-[600px]">
                    {/* Tab Bar — scrolls horizontally on mobile */}
                    <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1 sm:gap-3 px-4 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                                    ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="p-4 sm:p-8">
                        {activeTab === 'users' && (
                            <div>
                                <h2 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
                                    <Users className="text-blue-500" /> User Management
                                </h2>
                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {pendingUsers.map(user => (
                                                <tr key={user._id} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                                                {user.username[0].toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-slate-900">{user.username}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.isApproved
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {user.isApproved ? 'APPROVED' : 'PENDING'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {!user.isApproved && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => approveUser(user._id)}
                                                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                                                                >
                                                                    <Check size={12} /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => rejectUser(user._id)}
                                                                    className="px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-1"
                                                                >
                                                                    <XCircle size={12} /> Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {pendingUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 italic">
                                                        No users found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
                                    <Package className="text-purple-500" /> System Orders
                                </h2>
                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Products</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                        {allOrders.map(order => {
                                            // ── Deleted order: show only a minimal placeholder row ──
                                            if (order.status === 'deleted') {
                                                return (
                                                    <tr key={order._id} className="bg-slate-50/60">
                                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-400">
                                                            {order.userId?.username || 'Unknown'}
                                                            <span className="block text-xs text-slate-400 mt-0.5">
                                                                Deleted: {new Date(order.updatedAt).toLocaleString('en-IN', {
                                                                    day: 'numeric', month: 'short', year: 'numeric', 
                                                                    hour: 'numeric', minute: '2-digit', hour12: true 
                                                                })}
                                                            </span>
                                                        </td>
                                                        {/* Items — show actual products */}
                                                        <td className="px-6 py-3 text-sm text-slate-400">
                                                            {order.products.length} items
                                                            <span className="block text-xs text-slate-400 truncate max-w-[150px]">
                                                                {order.products.map(p => p.name).join(', ')}
                                                            </span>
                                                        </td>
                                                        {/* Amount */}
                                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-slate-400">₹{order.totalAmount.toLocaleString()}</td>
                                                        {/* Status */}
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-slate-200 text-slate-500">
                                                                ORDER DELETED
                                                            </span>
                                                        </td>
                                                        {/* View button */}
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            <button
                                                                onClick={() => setSelectedOrder(order)}
                                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-200"
                                                            >
                                                                <Eye size={12} /> View
                                                            </button>
                                                        </td>
                                                        {/* Actions column */}
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-50 text-red-600 text-[11px] font-bold border border-red-200 shadow-sm leading-none tracking-wide uppercase">
                                                                Deleted by User
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            // ── Normal / edited orders ──
                                            return (
                                                <tr key={order._id} className={`hover:bg-slate-50/50 ${order.isEdited ? 'bg-amber-50/60' : ''}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                        {order.userId?.username || 'Unknown'}
                                                        <span className="block text-xs text-slate-400 mt-0.5">
                                                            {order.isEdited ? 'Updated: ' : 'Placed: '} 
                                                            {new Date(order.isEdited ? order.updatedAt : order.createdAt).toLocaleString('en-IN', {
                                                                day: 'numeric', month: 'short', year: 'numeric', 
                                                                hour: 'numeric', minute: '2-digit', hour12: true 
                                                            })}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {order.products.length} items
                                                        <span className="block text-xs text-slate-400 truncate max-w-[150px]">
                                                            {order.products.map(p => p.name).join(', ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                                order.status === 'approved' ? 'bg-green-100 text-green-700'
                                                                : order.status === 'rejected' ? 'bg-red-100 text-red-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                            }`}>
                                                                {order.status.toUpperCase()}
                                                            </span>
                                                            {order.isEdited && (
                                                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                                                    EDITED
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-200"
                                                        >
                                                            <Eye size={12} /> View
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {order.status !== 'approved' && (
                                                                <button
                                                                    onClick={() => updateOrderStatus(order._id, 'approved')}
                                                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                                                >
                                                                    <Check size={12} /> Approve
                                                                </button>
                                                            )}
                                                            {order.status !== 'rejected' && (
                                                                <button
                                                                    onClick={() => setOrderToReject(order._id)}
                                                                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                                                                >
                                                                    <XCircle size={12} /> Reject
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                            {allOrders.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500 italic">
                                                        No orders found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Products Tab ─────────────────────────────────────── */}
                        {activeTab === 'products' && (
                            <div>
                                <h2 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
                                    <ShoppingBag className="text-indigo-500" /> Product Management
                                </h2>

                                {/* Add Product Form */}
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8">
                                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <Plus size={16} /> Add New Product
                                    </h3>
                                    {productMsg.text && (
                                        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${productMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                            {productMsg.text}
                                        </div>
                                    )}
                                    <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Product Name *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Rose Agarbatti"
                                                value={newProduct.product_name}
                                                onChange={e => setNewProduct({ ...newProduct, product_name: e.target.value })}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Price (₹) *</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                placeholder="e.g. 250"
                                                value={newProduct.price}
                                                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category *</label>
                                            <select
                                                required
                                                value={newProduct.category}
                                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Image URL <span className="normal-case text-slate-400 font-normal">(Google Drive links auto-converted)</span></label>
                                            <input
                                                type="text"
                                                placeholder="Paste any image URL or Google Drive share link"
                                                value={newProduct.image_url}
                                                onChange={e => {
                                                    const converted = convertDriveUrl(e.target.value.trim());
                                                    setNewProduct({ ...newProduct, image_url: converted });
                                                }}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            />
                                            {/* Live preview */}
                                            {newProduct.image_url && (
                                                <div className="mt-2 flex items-center gap-3">
                                                    <img
                                                        src={newProduct.image_url}
                                                        alt="Preview"
                                                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                                                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                        onLoad={e => { e.target.style.display = 'block'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'none'; }}
                                                    />
                                                    <div style={{ display: 'none' }} className="w-16 h-16 rounded-lg border border-red-200 bg-red-50 items-center justify-center text-red-400 text-xs font-semibold">No image</div>
                                                    <p className="text-xs text-slate-400">Preview — if blank, the URL may not allow embedding.</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                                            <textarea
                                                rows={2}
                                                placeholder="Short product description..."
                                                value={newProduct.description}
                                                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex justify-end">
                                            <button type="submit" className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                                                <Plus size={14} /> Add Product
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Category Filter */}
                                <div className="flex flex-wrap gap-2 mb-4 items-center">
                                    <Filter size={14} className="text-slate-400" />
                                    <button
                                        onClick={() => setFilterCategory('all')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${filterCategory === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-900'}`}
                                    >
                                        All ({allProducts.length})
                                    </button>
                                    {categories.map(cat => {
                                        const count = allProducts.filter(p => p.category === cat.id).length;
                                        if (count === 0) return null;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFilterCategory(cat.id)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${filterCategory === cat.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-900'}`}
                                            >
                                                {cat.name} ({count})
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Products Table */}
                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Product</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Price</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Description</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {filteredProducts.map(product => (
                                                <tr key={product._id} className="hover:bg-slate-50/50">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {product.image_url ? (
                                                                <img src={convertDriveUrl(product.image_url)} alt={product.product_name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-400">
                                                                    <ShoppingBag size={16} />
                                                                </div>
                                                            )}
                                                            <span className="font-medium text-slate-900 text-sm">{product.product_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                                                            {categories.find(c => c.id === product.category)?.name || product.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold text-slate-900">₹{product.price?.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-500 max-w-[200px] truncate">{product.description || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => openEdit(product)}
                                                                className="px-2 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-200"
                                                            >
                                                                <Pencil size={12} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => deleteProduct(product._id)}
                                                                className="px-2 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-200"
                                                            >
                                                                <Trash2 size={12} /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredProducts.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                                                        No products found. Add one above!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Edit Product Modal ── */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditingProduct(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-heading font-bold text-lg">Edit Product</h3>
                                <p className="text-slate-400 text-xs truncate max-w-xs">{editingProduct.product_name}</p>
                            </div>
                            <button onClick={() => setEditingProduct(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={saveEdit} className="p-6 space-y-4">
                            {editMsg.text && (
                                <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${editMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {editMsg.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Product Name *</label>
                                    <input
                                        type="text" required
                                        value={editingProduct.product_name}
                                        onChange={e => setEditingProduct({ ...editingProduct, product_name: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Price (₹) *</label>
                                    <input
                                        type="number" required min="0"
                                        value={editingProduct.price}
                                        onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category *</label>
                                    <select
                                        required
                                        value={editingProduct.category}
                                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        value={editingProduct.image_url}
                                        onChange={e => setEditingProduct({ ...editingProduct, image_url: convertDriveUrl(e.target.value.trim()) })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                    {editingProduct.image_url && (
                                        <img src={editingProduct.image_url} alt="preview" className="mt-2 w-14 h-14 rounded-lg object-cover border border-slate-200" />
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                                    <textarea
                                        rows={2}
                                        value={editingProduct.description}
                                        onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditingProduct(null)} className="px-5 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                                    <Pencil size={14} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Order Products Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-heading font-bold text-lg">Order Details</h3>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Customer & Date Info */}
                        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-sm">
                            <div className="flex flex-col">
                                <span className="text-slate-500">Customer: <span className="font-semibold text-slate-800">{selectedOrder.userId?.username || 'Unknown'}</span></span>
                                <span className="text-xs text-slate-400 mt-0.5">
                                    {selectedOrder.isEdited ? 'Updated: ' : 'Placed: '} 
                                    {new Date(selectedOrder.isEdited ? selectedOrder.updatedAt : selectedOrder.createdAt).toLocaleString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric', 
                                        hour: 'numeric', minute: '2-digit', hour12: true 
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    selectedOrder.status === 'approved' ? 'bg-green-100 text-green-700'
                                    : selectedOrder.status === 'rejected' ? 'bg-red-100 text-red-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>{selectedOrder.status.toUpperCase()}</span>
                                {selectedOrder.isEdited && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">EDITED</span>
                                )}
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="px-6 py-4 max-h-80 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                                        <th className="text-left pb-2">Product</th>
                                        <th className="text-center pb-2">Qty</th>
                                        <th className="text-right pb-2">Unit Price</th>
                                        <th className="text-right pb-2">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {selectedOrder.products.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="py-2.5 font-medium text-slate-800">{p.name}</td>
                                            <td className="py-2.5 text-center text-slate-500">{p.quantity}</td>
                                            <td className="py-2.5 text-right text-slate-500">₹{p.price}</td>
                                            <td className="py-2.5 text-right font-semibold text-slate-900">₹{(p.price * p.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-slate-500 text-sm">{selectedOrder.products.length} product(s)</span>
                            <span className="text-lg font-heading font-bold text-slate-900">
                                Total: ₹{selectedOrder.totalAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Product Deletion Modal ── */}
            {productToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setProductToDelete(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-red-600 text-white px-6 py-4 flex items-center gap-3">
                            <Trash2 size={20} />
                            <h3 className="font-heading font-bold text-lg">Delete Product</h3>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-slate-700 text-sm leading-relaxed">
                                Are you sure you want to delete this product? This action cannot be undone.
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button onClick={() => setProductToDelete(null)} className="px-5 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                            <button onClick={confirmDeleteProduct} className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                                <Trash2 size={14} /> Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── User Rejection Modal ── */}
            {userToReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setUserToReject(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-red-600 text-white px-6 py-4 flex items-center gap-3">
                            <XCircle size={20} />
                            <h3 className="font-heading font-bold text-lg">Reject User</h3>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-slate-700 text-sm leading-relaxed">
                                Are you sure you want to reject and delete this user?
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button onClick={() => setUserToReject(null)} className="px-5 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                            <button onClick={confirmRejectUser} className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                                <XCircle size={14} /> Yes, Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Order Rejection Modal ── */}
            {orderToReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOrderToReject(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-red-600 text-white px-6 py-4 flex items-center gap-3">
                            <XCircle size={20} />
                            <h3 className="font-heading font-bold text-lg">Reject Order</h3>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-slate-700 text-sm leading-relaxed">
                                Are you sure you want to reject this order?
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button onClick={() => setOrderToReject(null)} className="px-5 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                            <button onClick={confirmRejectOrder} className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                                <XCircle size={14} /> Yes, Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminDashboard;
