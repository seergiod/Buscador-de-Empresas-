import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Search, Filter, Building2, Download } from 'lucide-react';

// Datos Mock para empezar a ver el diseño sin gastar API
const MOCK_LEADS = [
    { id: 1, name: 'TechFlow Solutions', category: 'SaaS', location: 'Madrid, Centro', status: 'Nuevo' },
    { id: 2, name: 'Finanzas Capital', category: 'Fintech', location: 'Barcelona, 22@', status: 'Contactado' },
    { id: 3, name: 'E-Shop Logistics', category: 'E-commerce', location: 'Valencia, Puerto', status: 'Nuevo' },
];

function App() {
    const [activeFilter, setActiveFilter] = useState('Todos');

    return (
        <div className="flex h-screen overflow-hidden text-slate-200">

            {/* SIDEBAR - Filtros e Industria */}
            <motion.aside
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-72 glass-panel m-4 rounded-2xl flex flex-col p-6 z-10"
            >
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.5)] flex items-center justify-center">
                        <Building2 size={18} className="text-black" />
                    </div>
                    <h1 className="text-xl font-bold tracking-wider">LeadGen<span className="text-cyan-400">Pro</span></h1>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs uppercase text-slate-500 tracking-widest mb-3">Filtros de Industria</h3>
                        <div className="space-y-2">
                            {['Todos', 'SaaS', 'Fintech', 'E-commerce'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${activeFilter === filter
                                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                            : 'hover:bg-white/5 text-slate-400 border border-transparent'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* MAIN CONTENT - Mapa y Leads */}
            <main className="flex-1 flex flex-col p-4 pl-0 relative">

                {/* Top Search Bar */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel h-20 rounded-2xl mb-4 flex items-center justify-between px-6 z-10"
                >
                    <div className="flex items-center gap-3 w-1/2">
                        <Search className="text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar empresas por zona o nombre..."
                            className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 transition-colors">
                        <Download size={16} />
                        <span className="text-sm">Exportar Airtable</span>
                    </button>
                </motion.header>

                {/* Content Area (Mapa simulado + Lista) */}
                <div className="flex-1 flex gap-4 overflow-hidden z-10">

                    {/* Mock Map Area */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex-1 glass-panel rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/5"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                        <div className="text-center">
                            <Map size={48} className="mx-auto mb-4 text-cyan-500/50" />
                            <p className="text-slate-400">Mapa de Google se renderizará aquí</p>
                        </div>
                    </motion.div>

                    {/* Lead List Area */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="w-96 glass-panel rounded-2xl p-4 overflow-y-auto"
                    >
                        <h2 className="text-lg font-semibold mb-4 px-2">Empresas Encontradas</h2>
                        <div className="space-y-3">
                            {MOCK_LEADS.map((lead, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    key={lead.id}
                                    className="bg-black/40 border border-white/5 p-4 rounded-xl hover:border-cyan-500/30 transition-colors cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">{lead.name}</h4>
                                        <span className="text-[10px] uppercase px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                                            {lead.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        <Map size={12} /> {lead.location}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </main>

            {/* Background Particles (Simulated with simple CSS divs for now) */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        </div>
    );
}

export default App;