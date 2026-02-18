import React, { useState } from 'react';
import { products, categories } from '../data/products';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowRight } from 'lucide-react';

const Home = () => {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredProducts =
        activeCategory === 'all'
            ? products
            : products.filter(p => p.category === activeCategory);

    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative bg-slate-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519638831568-d9897f54ed69?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20"></div>
                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                    <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight">
                        Experience Pure <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Divine Fragrance</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 font-light">
                        Elevate your prayers with our premium collection of hand-rolled incense sticks. Scented with nature, crafted for peace.
                    </p>
                    <Link to="/signup" className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors flex items-center gap-2 group">
                        Shop Collection <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Product Catalog */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-slate-900">Our Premium Collection</h2>
                        <div className="w-24 h-1 bg-slate-900 mx-auto rounded-full"></div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${activeCategory === 'all'
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-900'
                                }`}
                        >
                            All Products
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${activeCategory === cat.id
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-900'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-2xl overflow-hidden card-hover border border-slate-100 shadow-sm group">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                    {/* Category Badge */}
                                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {categories.find(c => c.id === product.category)?.name}
                                    </span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 font-heading text-slate-900">{product.name}</h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                                        <Link to="/login" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-colors">
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Home;
