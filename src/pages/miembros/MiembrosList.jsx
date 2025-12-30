import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Plus, User, MapPin, Phone, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MiembrosList() {
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/miembros')
            .then(res => setMiembros(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = miembros.filter(m => 
        m.nombres.toLowerCase().includes(search.toLowerCase()) || 
        m.apellidos.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Miembros</h1>
                    <p className="text-gray-400">Gestión de personal y músicos</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <Input 
                            placeholder="Buscar miembro..." 
                            className="pl-10 w-full md:w-64" 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Link to="nuevo">
                        <Button>
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Miembro
                        </Button>
                    </Link>
                </div>
            </div>

            {loading ? (
                 <div className="text-white text-center py-20">Cargando lista...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(miembro => (
                        <div key={miembro.id_miembro} className="bg-[#161b2c] border border-white/5 p-5 rounded-2xl hover:border-indigo-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-lg">
                                        {miembro.nombres.charAt(0)}{miembro.apellidos.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{miembro.nombres} {miembro.apellidos}</h3>
                                        <p className="text-sm text-gray-400">{miembro.rol?.rol || 'Sin Rol'}</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                    ACTIVO
                                </span>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-indigo-500" />
                                    <span>{miembro.seccion?.seccion} • {miembro.categoria?.nombre_categoria}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-purple-500" />
                                    <span>{miembro.celular}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-pink-500" />
                                    <span className="truncate max-w-[200px]">{miembro.direccion || 'Sin dirección'}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost">Ver Perfil</Button>
                                <Button size="sm" variant="secondary">Editar</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
