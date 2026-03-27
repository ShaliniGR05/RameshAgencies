import React, { useState, useEffect } from 'react';
import { products as staticProducts, categories } from '../data/products';
import axios from 'axios';
import API_BASE_URL from '../api';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowRight, Phone, MapPin, XCircle } from 'lucide-react';

// Converts a Google Drive share URL to a browser-renderable thumbnail URL.
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

const Home = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [dbProducts, setDbProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/products`)
            .then(res => setDbProducts(res.data))
            .catch(() => { });
    }, []);

    // Merge DB products (first) with static products
    const allProducts = [
        ...dbProducts.map(p => ({
            id: `db-${p._id}`,
            name: p.product_name,
            description: p.description || '',
            price: p.price,
            image: convertDriveUrl(p.image_url || ''),
            category: p.category,
            isNew: true
        })),
        ...staticProducts
    ];

    const filteredProducts =
        activeCategory === 'all'
            ? allProducts
            : allProducts.filter(p => p.category === activeCategory);

    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative bg-slate-900 text-white py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/tanjore_temple.png')] bg-cover bg-center opacity-20"></div>
                <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-extrabold mb-4 md:mb-6 leading-tight">
                        Experience Pure <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Divine Fragrance</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mb-8 md:mb-10 font-light">
                        Elevate your prayers with our premium collection of hand-rolled incense sticks. Scented with nature, crafted for peace.
                    </p>
                    <Link to="/signup" className="bg-white text-slate-900 px-6 md:px-8 py-3 rounded-full font-bold text-base md:text-lg hover:bg-blue-50 transition-colors flex items-center gap-2 group">
                        Shop Collection <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* About Us Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        {/* Text Content (Left) */}
                        <div className="lg:w-1/2 flex flex-col items-start text-left">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-4 md:mb-6 text-slate-900 leading-tight">
                                Tradition of Quality & <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">Divine Fragrance</span>
                            </h2>
                            <div className="w-20 md:w-24 h-1.5 bg-gradient-to-r from-orange-400 to-yellow-400 mb-6 md:mb-8 rounded-full"></div>
                            <p className="text-base md:text-lg text-slate-600 mb-8 font-light leading-relaxed">
                                Ramesh Agencies has been a trusted supplier of premium incense sticks and pooja items, bringing divine fragrance and peace to countless homes. We carefully source the finest natural ingredients to craft products that elevate your spiritual experience.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full mb-2 lg:mb-4">
                                <a href="tel:9842651896" className="flex-1 flex items-center gap-3 md:gap-4 bg-slate-50 p-4 rounded-xl md:rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all group">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white shadow-sm rounded-full flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 transition-transform border border-slate-100">
                                        <Phone size={20} className="fill-orange-50 stroke-orange-600 md:w-[22px] md:h-[22px]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5 md:mb-1">Call Us</p>
                                        <p className="text-base md:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">9842651896</p>
                                    </div>
                                </a>
                                
                                <a href="https://share.google/53UX6mMNjik7aCjEV" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-3 md:gap-4 bg-slate-50 p-4 rounded-xl md:rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all group">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white shadow-sm rounded-full flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 transition-transform border border-slate-100">
                                        <MapPin size={20} className="fill-orange-50 stroke-orange-600 md:w-[22px] md:h-[22px]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5 md:mb-1">Visit Us</p>
                                        <p className="text-sm md:text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors underline decoration-slate-300 underline-offset-4 group-hover:decoration-orange-300">
                                            Google Maps
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Image (Right) */}
                        <div className="lg:w-1/2 relative group w-full mt-4 lg:mt-0">
                            <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-tr from-orange-200 to-yellow-100 rounded-[2rem] md:rounded-[2.5rem] blur-xl md:blur-2xl opacity-50 group-hover:opacity-75 transition duration-700"></div>
                            <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl md:shadow-2xl border-4 md:border-8 border-white aspect-[4/3] md:aspect-video lg:aspect-[4/3]">
                                <img src="/assets/about.png" alt="About Ramesh Agencies" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 md:via-slate-900/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 text-white transform translate-y-1 md:translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold font-heading mb-1 md:mb-2 text-white shadow-sm">Premium Quality</p>
                                    <p className="text-white/90 font-medium text-sm md:text-lg drop-shadow-md flex items-center gap-2">
                                        <span className="w-6 md:w-8 h-[2px] bg-orange-400"></span>
                                        Serving with devotion
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Catalog */}
            <section className="py-16 md:py-20 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-3 md:mb-4 text-slate-900 px-2">Our Premium Collection</h2>
                        <div className="w-16 md:w-24 h-1 bg-slate-900 mx-auto rounded-full"></div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-12">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-colors border ${activeCategory === 'all'
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
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-colors border ${activeCategory === cat.id
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-900'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {filteredProducts.map(product => (
                            <div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-white rounded-2xl overflow-hidden card-hover border border-slate-100 shadow-sm group cursor-pointer flex flex-col">
                                <div className="relative h-56 md:h-64 overflow-hidden flex-shrink-0">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.style.display='none'; e.target.parentNode.style.background='linear-gradient(135deg,#f1f5f9,#e2e8f0)'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                    {/* Category Badge */}
                                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                        {categories.find(c => c.id === product.category)?.name}
                                    </span>
                                    {/* NEW badge for DB products */}
                                    {product.isNew && (
                                        <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-sm">NEW</span>
                                    )}
                                </div>
                                <div className="p-5 md:p-6 flex flex-col flex-1">
                                    <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 font-heading text-slate-900 leading-tight line-clamp-2">{product.name}</h3>
                                    <p className="text-slate-500 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 flex-1">{product.description}</p>
                                    <div className="flex items-center justify-between mt-auto pt-2">
                                        <span className="text-xl md:text-2xl font-bold text-slate-900 pr-2">₹{product.price.toLocaleString()}</span>
                                        <Link 
                                            to="/login" 
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-colors shrink-0"
                                        >
                                            <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
                        {/* Close button */}
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
                                <Link
                                    to="/login"
                                    className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    Login to Buy — ₹{selectedProduct.price}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Home;
