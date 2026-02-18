import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Users, Package, Check, Clock, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
    // ... (Keep existing logic)
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('users');

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchPendingUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/all-users', config);
            setPendingUsers(res.data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const fetchAllOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders', config);
            setAllOrders(res.data);
        } catch (error) {
            console.error('Error fetching orders', error);
        }
    };

    const approveUser = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/auth/approve-user/${id}`, {}, config);
            fetchPendingUsers();
        } catch (error) {
            console.error('Error approving user', error);
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }, config);
            fetchAllOrders();
        } catch (error) {
            console.error('Error updating order status', error);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
        fetchAllOrders();
    }, []);

    const tabs = [
        { id: 'users', label: 'User Approvals', icon: Users, count: pendingUsers.length },
        { id: 'orders', label: 'Order Management', icon: Package, count: allOrders.length },
    ];

    return (
        <Layout>
            <div className="bg-slate-900 text-white py-12">
                <div className="container mx-auto px-6">
                    <h1 className="text-3xl font-heading font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400">Manage user access and oversee order fulfillment.</p>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-8">
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden min-h-[600px]">
                    <div className="flex border-b border-slate-100">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-8 py-5 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.id
                                    ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
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
                                                            <button
                                                                onClick={() => approveUser(user._id)}
                                                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                                                            >
                                                                <Check size={12} /> Approve
                                                            </button>
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
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {allOrders.map(order => (
                                                <tr key={order._id} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">#{order._id.slice(-6)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{order.userId?.username || 'Unknown'}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {order.products.length} items
                                                        <span className="block text-xs text-slate-400 truncate max-w-[200px]">
                                                            {order.products.map(p => p.name).join(', ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.status === 'approved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {order.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {order.status !== 'approved' && (
                                                            <button
                                                                onClick={() => updateOrderStatus(order._id, 'approved')}
                                                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                                            >
                                                                <Check size={12} /> Approve Order
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {allOrders.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500 italic">
                                                        No orders found.
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
        </Layout>
    );
};

export default AdminDashboard;
