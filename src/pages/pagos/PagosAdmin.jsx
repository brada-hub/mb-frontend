import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, DollarSign, Calendar, ChevronRight, CheckCircle2, 
    Search, Filter, ArrowLeft, ArrowUpRight, History, Printer
} from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import clsx from 'clsx';
import { Button } from '../../components/ui/Button';
import ConfirmModal from '../../components/modals/ConfirmModal';

export default function PagosAdmin() {
    const { notify } = useToast();
    const [deudas, setDeudas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberDetails, setMemberDetails] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [selection, setSelection] = useState([]); // IDs de convocatorias seleccionadas para pagar
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal de Confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [processingPago, setProcessingPago] = useState(false);

    useEffect(() => {
        loadDeudas();
    }, []);

    const loadDeudas = async () => {
        setLoading(true);
        try {
            const res = await api.get('/pagos/deudas');
            setDeudas(res.data);
        } catch (error) {
            console.error(error);
            notify('Error al cargar deudas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePrintPlanilla = async () => {
        try {
            // Using window.open allows the browser to handle the download better in some cases,
            // but for authenticated APIs usually we need to fetch blob.
            // Let's try direct open first if auth cookie is set, but since we use Bearer token header,
            // we really should use axios blob download.
            
            const response = await api.get('/pagos/reporte-pdf', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `planilla_deudas_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            notify('Reporte descargado', 'success');
        } catch (error) {
            console.error(error);
            notify('Error al generar PDF', 'error');
        }
    };

    const handleSelectMember = async (member) => {
        setSelectedMember(member);
        setSelection([]); // Reset selection
        setLoadingDetails(true);
        try {
            const res = await api.get(`/pagos/deudas/${member.id_miembro}`);
            setMemberDetails(res.data);
            // Auto select all by default? Let's select all for convenience
            setSelection(res.data.map(d => d.id_convocatoria));
        } catch (error) {
            notify('Error al cargar detalle', 'error');
        } finally {
            setLoadingDetails(false);
        }
    };

    const toggleSelection = (id) => {
        setSelection(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handlePagar = () => {
        if (selection.length === 0) return;
        setShowConfirmModal(true);
    };

    const handleConfirmPago = async () => {
        setProcessingPago(true);
        try {
            await api.post('/pagos/pagar', { id_convocatorias: selection });
            notify('Pagos registrados exitosamente', 'success');
            
            // Recargar datos
            await loadDeudas(); // Recargar lista general
            
            // Si quedan deudas del miembro, recargar detalle, sino cerrar
            const updatedDetails = memberDetails.filter(d => !selection.includes(d.id_convocatoria));
            if (updatedDetails.length > 0) {
                setMemberDetails(updatedDetails);
                setSelection(updatedDetails.map(d => d.id_convocatoria));
            } else {
                setSelectedMember(null);
            }
            setShowConfirmModal(false);
        } catch (error) {
            notify('Error al procesar pago', 'error');
        } finally {
            setProcessingPago(false);
        }
    };

    const filteredDeudas = deudas.filter(d => 
        `${d.nombres} ${d.apellidos}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.instrumento.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalDeudaGlobal = deudas.reduce((acc, curr) => acc + curr.total_eventos, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Cuentas por Pagar</h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Gestión de Tesorería</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={handlePrintPlanilla}
                        variant="ghost"
                        className="hidden sm:flex bg-white/5 hover:bg-white/10 text-gray-300 gap-2 border border-white/10"
                    >
                        <Printer className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Imprimir Planilla</span>
                    </Button>
                    <div className="bg-surface-card border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Pendiente</p>
                            <p className="text-xl font-black text-white leading-none">{totalDeudaGlobal} <span className="text-xs text-gray-500 font-medium">EVENTOS</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Lista de Deudores */}
                <div className={clsx(
                    "lg:col-span-5 flex flex-col gap-4 bg-surface-card border border-white/5 rounded-3xl p-4 overflow-hidden",
                    selectedMember && "hidden lg:flex"
                )}>
                    {/* Buscador */}
                    <div className="relative shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar músico..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#11141d] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                        />
                    </div>

                    {/* Lista Scrolleable */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Calculando deudas...</p>
                            </div>
                        ) : filteredDeudas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                                <DollarSign className="w-12 h-12 text-gray-600 mb-2" />
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Todo al día</p>
                                <p className="text-xs text-gray-600">No hay pagos pendientes</p>
                            </div>
                        ) : (
                            filteredDeudas.map(item => (
                                <button
                                    key={item.id_miembro}
                                    onClick={() => handleSelectMember(item)}
                                    className={clsx(
                                        "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                                        selectedMember?.id_miembro === item.id_miembro 
                                            ? "bg-brand-primary/10 border-brand-primary/50" 
                                            : "bg-[#161b2c] border-white/5 hover:border-white/10 hover:bg-[#1a2035]"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-colors",
                                            selectedMember?.id_miembro === item.id_miembro
                                                ? "bg-brand-primary text-white"
                                                : "bg-[#252b43] text-gray-400 group-hover:text-white"
                                        )}>
                                            {item.nombres.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={clsx(
                                                "font-bold text-sm leading-tight",
                                                selectedMember?.id_miembro === item.id_miembro ? "text-white" : "text-gray-300"
                                            )}>
                                                {item.nombres} {item.apellidos}
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.instrumento}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-lg font-black text-white">{item.total_eventos}</span>
                                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Pendientes</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detalle y Pago */}
                <div className={clsx(
                    "lg:col-span-7 flex flex-col h-full",
                    !selectedMember && "hidden lg:flex lg:items-center lg:justify-center"
                )}>
                    {selectedMember ? (
                        <div className="bg-surface-card border border-white/5 rounded-3xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300">
                            {/* Header Detalle */}
                            <div className="p-6 border-b border-white/5 bg-[#161b2c]">
                                <div className="flex items-center gap-4 mb-6">
                                    <button 
                                        onClick={() => setSelectedMember(null)}
                                        className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{selectedMember.nombres} {selectedMember.apellidos}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-purple-500/20">
                                                {memberDetails.length} Eventos
                                            </span>
                                            <span className="text-gray-500 text-xs">•</span>
                                            <span className="text-gray-500 text-xs uppercase font-medium">Seleccionados: <span className="text-white font-bold">{selection.length}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     <Button 
                                        onClick={handlePagar}
                                        disabled={selection.length === 0}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs py-3"
                                    >
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Pagar Seleccionados ({selection.length})
                                    </Button>
                                </div>
                            </div>

                            {/* Lista Detalle */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b0e14] custom-scrollbar">
                                {loadingDetails ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    memberDetails.map((detalle, idx) => (
                                        <div 
                                            key={detalle.id_convocatoria}
                                            onClick={() => toggleSelection(detalle.id_convocatoria)}
                                            className={clsx(
                                                "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all select-none group",
                                                selection.includes(detalle.id_convocatoria)
                                                    ? "bg-indigo-600/10 border-indigo-500/50"
                                                    : "bg-[#161b2c] border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                selection.includes(detalle.id_convocatoria)
                                                    ? "bg-indigo-500 border-indigo-500"
                                                    : "border-white/20 group-hover:border-white/40"
                                            )}>
                                                {selection.includes(detalle.id_convocatoria) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-white font-bold text-sm leading-tight">{detalle.evento}</h3>
                                                    <span className={clsx(
                                                        "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                                                        detalle.tipo === 'CONTRATO' 
                                                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                    )}>
                                                        {detalle.tipo}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(detalle.fecha).toLocaleDateString()}
                                                    </span>
                                                    <span className={clsx(
                                                        "flex items-center gap-1 font-black",
                                                        detalle.estado_asistencia === 'PUNTUAL' ? "text-green-500" :
                                                        detalle.estado_asistencia === 'RETRASO' ? "text-yellow-500" : "text-gray-400"
                                                    )}>
                                                        {detalle.estado_asistencia}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <DollarSign className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Tesorería</h3>
                            <p className="text-sm text-gray-400 max-w-xs">Selecciona un músico de la lista para ver su detalle de pagos pendientes.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal 
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmPago}
                title="Confirmar Pago"
                message={`¿Estás seguro de registrar el pago de ${selection.length} eventos a ${selectedMember?.nombres} ${selectedMember?.apellidos}?`}
                confirmText={processingPago ? "Procesando..." : "Confirmar Pago"}
                variant="primary"
            />
        </div>
    );
}
