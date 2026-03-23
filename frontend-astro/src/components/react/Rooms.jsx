import { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '@/api/rooms';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, LayoutGrid, List } from 'lucide-react';

const ROOM_TYPES = ['single', 'double', 'suite', 'deluxe'];
const STATUSES = ['available', 'occupied', 'maintenance'];
const emptyForm = { room_number: '', type: 'single', price_per_night: '', status: 'available', floor: '', max_occupancy: '', amenities: '' };

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [viewMode, setViewMode] = useState('table');
    const [sortField, setSortField] = useState('room_number');
    const [sortDir, setSortDir] = useState('asc');
    const toast = useToast();

    const fetchRooms = async () => {
        try {
            const params = {};
            if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
            if (filterType && filterType !== 'all') params.type = filterType;
            const res = await getRooms(params);
            setRooms(res.data);
        } catch { toast.error('Failed to load rooms'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRooms(); }, [filterStatus, filterType]);

    const openAdd = () => { setEditingRoom(null); setForm(emptyForm); setDialogOpen(true); };
    const openEdit = (room) => {
        setEditingRoom(room);
        setForm({ room_number: room.room_number, type: room.type, price_per_night: room.price_per_night, status: room.status, floor: room.floor, max_occupancy: room.max_occupancy, amenities: room.amenities || '' });
        setDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) { await updateRoom(editingRoom.room_id, form); toast.success('Room updated'); }
            else { await createRoom(form); toast.success('Room created'); }
            setDialogOpen(false); fetchRooms();
        } catch (err) { toast.error(err.response?.data?.error || 'Operation failed'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Set this room to maintenance?')) return;
        try { await deleteRoom(id); toast.success('Room set to maintenance'); fetchRooms(); }
        catch { toast.error('Failed to update room'); }
    };

    const sorted = [...rooms].sort((a, b) => {
        const av = a[sortField], bv = b[sortField];
        return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const statusVariant = { available: 'default', occupied: 'destructive', maintenance: 'secondary' };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="spinner" /></div>;

    return (
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-semibold">Rooms</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">{rooms.length} total rooms</p>
                </div>
                <Button onClick={openAdd}><Plus size={16} /> Add Room</Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center px-4 lg:px-6">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {ROOM_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div className="ml-auto flex gap-1 bg-muted rounded-lg p-0.5">
                    <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon-sm" onClick={() => setViewMode('table')}><List size={16} /></Button>
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon-sm" onClick={() => setViewMode('grid')}><LayoutGrid size={16} /></Button>
                </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' ? (
                <Card>
                    <CardContent className="pt-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[['room_number', 'Room'], ['type', 'Type'], ['floor', 'Floor'], ['max_occupancy', 'Capacity'], ['price_per_night', 'Price/Night'], ['status', 'Status']].map(([f, label]) => (
                                        <TableHead key={f} className="cursor-pointer select-none" onClick={() => toggleSort(f)}>
                                            {label} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sorted.map(r => (
                                    <TableRow key={r.room_id}>
                                        <TableCell className="font-semibold">{r.room_number}</TableCell>
                                        <TableCell className="capitalize">{r.type}</TableCell>
                                        <TableCell>Floor {r.floor}</TableCell>
                                        <TableCell>{r.max_occupancy}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(r.price_per_night)}</TableCell>
                                        <TableCell><Badge variant={statusVariant[r.status]}>{r.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)}><Pencil size={15} /></Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(r.room_id)}><Trash2 size={15} /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sorted.map(r => (
                        <Card key={r.room_id}>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold">Room {r.room_number}</h3>
                                    <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                                </div>
                                <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                                    <p><span className="font-medium">Type:</span> <span className="capitalize">{r.type}</span></p>
                                    <p><span className="font-medium">Floor:</span> {r.floor}</p>
                                    <p><span className="font-medium">Capacity:</span> {r.max_occupancy} guests</p>
                                    <p><span className="font-medium">Price:</span> <span className="font-semibold text-foreground">{formatCurrency(r.price_per_night)}</span>/night</p>
                                </div>
                                <div className="flex gap-2 pt-3 border-t">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(r)}>Edit</Button>
                                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(r.room_id)}>Maintenance</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Room Number *</Label><Input required value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })} className="mt-1" /></div>
                            <div>
                                <Label>Type *</Label>
                                <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="mt-1 flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">
                                    {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Price/Night (₹) *</Label><Input required type="number" min="0" step="0.01" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: e.target.value })} className="mt-1" /></div>
                            <div>
                                <Label>Status *</Label>
                                <select required value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="mt-1 flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Floor *</Label><Input required type="number" min="1" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} className="mt-1" /></div>
                            <div><Label>Max Occupancy *</Label><Input required type="number" min="1" value={form.max_occupancy} onChange={e => setForm({ ...form, max_occupancy: e.target.value })} className="mt-1" /></div>
                        </div>
                        <div><Label>Amenities</Label><Input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, AC, TV..." className="mt-1" /></div>
                        <DialogFooter showCloseButton>
                            <Button type="submit">{editingRoom ? 'Save Changes' : 'Create Room'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
