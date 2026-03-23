import { useState, useEffect } from 'react';
import { getGuests, createGuest, updateGuest, deleteGuest, getGuest } from '@/api/guests';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, Trash2, Search, Eye, X } from 'lucide-react';

const ID_TYPES = ['passport', 'aadhar', 'driving_license', 'pan'];
const emptyForm = { first_name: '', last_name: '', email: '', phone: '', address: '', id_type: '', id_number: '' };

export default function Guests() {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [sortField, setSortField] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const toast = useToast();

    const fetchGuests = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            setGuests((await getGuests(params)).data);
        } catch { toast.error('Failed to load guests'); }
        finally { setLoading(false); }
    };

    useEffect(() => { const t = setTimeout(fetchGuests, 300); return () => clearTimeout(t); }, [search]);

    const openAdd = () => { setEditingGuest(null); setForm(emptyForm); setDialogOpen(true); };
    const openEdit = (g) => {
        setEditingGuest(g);
        setForm({ first_name: g.first_name, last_name: g.last_name, email: g.email, phone: g.phone || '', address: g.address || '', id_type: g.id_type || '', id_number: g.id_number || '' });
        setDialogOpen(true);
    };

    const showHistory = async (g) => {
        try { setSelectedGuest((await getGuest(g.guest_id)).data); }
        catch { toast.error('Failed to load guest details'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGuest) { await updateGuest(editingGuest.guest_id, form); toast.success('Guest updated'); }
            else { await createGuest(form); toast.success('Guest added'); }
            setDialogOpen(false); fetchGuests();
        } catch (err) { toast.error(err.response?.data?.error || 'Operation failed'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this guest?')) return;
        try { await deleteGuest(id); toast.success('Guest deleted'); fetchGuests(); }
        catch (err) { toast.error(err.response?.data?.error || 'Cannot delete guest'); }
    };

    const sorted = [...guests].sort((a, b) => {
        const av = a[sortField], bv = b[sortField];
        return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });

    const toggleSort = (f) => {
        if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(f); setSortDir('asc'); }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="spinner" /></div>;

    return (
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-semibold">Guests</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">{guests.length} registered guests</p>
                </div>
                <Button onClick={openAdd}><Plus size={16} /> Add Guest</Button>
            </div>

            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="pl-9" />
            </div>

            <div className="flex gap-6">
                <Card className={selectedGuest ? 'flex-1' : 'w-full'}>
                    <CardContent className="pt-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[['first_name', 'Name'], ['email', 'Email'], ['phone', 'Phone'], ['id_type', 'ID Type'], ['created_at', 'Joined']].map(([f, label]) => (
                                        <TableHead key={f} className="cursor-pointer select-none" onClick={() => toggleSort(f)}>
                                            {label} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sorted.map(g => (
                                    <TableRow key={g.guest_id} className="cursor-pointer" onClick={() => showHistory(g)}>
                                        <TableCell className="font-medium">{g.first_name} {g.last_name}</TableCell>
                                        <TableCell>{g.email}</TableCell>
                                        <TableCell>{g.phone || '—'}</TableCell>
                                        <TableCell className="capitalize">{g.id_type?.replace('_', ' ') || '—'}</TableCell>
                                        <TableCell>{formatDate(g.created_at)}</TableCell>
                                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon-sm" onClick={() => showHistory(g)}><Eye size={15} /></Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(g)}><Pencil size={15} /></Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(g.guest_id)}><Trash2 size={15} /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {sorted.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No guests found</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {selectedGuest && (
                    <Card className="w-80 flex-shrink-0 self-start sticky top-8">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Guest Details</CardTitle>
                                <Button variant="ghost" size="icon-sm" onClick={() => setSelectedGuest(null)}><X size={16} /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                            <p className="text-lg font-bold">{selectedGuest.first_name} {selectedGuest.last_name}</p>
                            <p className="text-muted-foreground text-sm">{selectedGuest.email}</p>
                            <p className="text-muted-foreground text-sm">{selectedGuest.phone || 'No phone'}</p>
                            {selectedGuest.id_type && <p className="text-muted-foreground text-sm capitalize">{selectedGuest.id_type.replace('_', ' ')}: {selectedGuest.id_number}</p>}
                            <Separator />
                            <h4 className="font-medium text-sm">Booking History</h4>
                            {selectedGuest.bookings?.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedGuest.bookings.map(b => (
                                        <div key={b.booking_id} className="p-3 bg-muted rounded-lg text-xs">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium">Room {b.room_number}</span>
                                                <Badge variant={b.status === 'cancelled' ? 'destructive' : b.status === 'checked_out' ? 'outline' : 'default'}>
                                                    {b.status?.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground">{formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-xs text-muted-foreground">No bookings yet</p>}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>{editingGuest ? 'Edit Guest' : 'Add New Guest'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>First Name *</Label><Input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="mt-1" /></div>
                            <div><Label>Last Name *</Label><Input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="mt-1" /></div>
                        </div>
                        <div><Label>Email *</Label><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
                            <div>
                                <Label>ID Type</Label>
                                <select value={form.id_type} onChange={e => setForm({ ...form, id_type: e.target.value })} className="mt-1 flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">
                                    <option value="">Select...</option>
                                    {ID_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>ID Number</Label><Input value={form.id_number} onChange={e => setForm({ ...form, id_number: e.target.value })} className="mt-1" /></div>
                            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
                        </div>
                        <DialogFooter showCloseButton>
                            <Button type="submit">{editingGuest ? 'Save Changes' : 'Add Guest'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
