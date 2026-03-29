import { useState, useEffect } from 'react';
import { getBookings, createBooking, checkinBooking, checkoutBooking, cancelBooking, getAvailability } from '@/api/bookings';
import { getGuests } from '@/api/guests';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LogIn, LogOut, XCircle } from 'lucide-react';

const STATUS_TABS = ['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
const emptyForm = { guest_id: '', room_id: '', check_in: '', check_out: '', adults: 1, children: 0, special_requests: '' };

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [guests, setGuests] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [sortField, setSortField] = useState('booking_created');
    const [sortDir, setSortDir] = useState('desc');
    const toast = useToast();

    const fetchBookings = async () => {
        try {
            const params = {};
            if (activeTab !== 'all') params.status = activeTab;
            setBookings((await getBookings(params)).data);
        } catch { toast.error('Failed to load bookings'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBookings(); }, [activeTab]);

    const openNewBooking = async () => {
        setForm(emptyForm); setAvailableRooms([]);
        try { setGuests((await getGuests()).data); } catch { toast.error('Failed to load guests'); }
        setDialogOpen(true);
    };

    useEffect(() => {
        if (form.check_in && form.check_out && form.check_out > form.check_in) {
            getAvailability({ check_in: form.check_in, check_out: form.check_out })
                .then(res => setAvailableRooms(res.data))
                .catch(() => toast.error('Failed to check availability'));
        }
    }, [form.check_in, form.check_out]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.check_out <= form.check_in) { toast.error('Check-out must be after check-in'); return; }
        try { await createBooking(form); toast.success('Booking created'); setDialogOpen(false); fetchBookings(); }
        catch (err) { toast.error(err.response?.data?.error || 'Failed to create booking'); }
    };

    const handleAction = async (id, action) => {
        const labels = { checkin: 'Check in', checkout: 'Check out', cancel: 'Cancel' };
        if (!confirm(`${labels[action]} this booking?`)) return;
        try {
            if (action === 'checkin') await checkinBooking(id);
            else if (action === 'checkout') await checkoutBooking(id);
            else if (action === 'cancel') await cancelBooking(id);
            toast.success(`Booking ${action === 'cancel' ? 'cancelled' : action === 'checkin' ? 'checked in' : 'checked out'}`);
            fetchBookings();
        } catch (err) { toast.error(err.response?.data?.error || 'Action failed'); }
    };

    const sorted = [...bookings].sort((a, b) => {
        const av = a[sortField] || '', bv = b[sortField] || '';
        return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });

    const toggleSort = (f) => {
        if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(f); setSortDir('asc'); }
    };

    const statusVariant = { confirmed: 'secondary', checked_in: 'default', checked_out: 'outline', cancelled: 'destructive' };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="spinner" /></div>;

    return (
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-semibold">Bookings</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">{bookings.length} bookings</p>
                </div>
                <Button onClick={openNewBooking}><Plus size={16} /> New Booking</Button>
            </div>

            {/* Status Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    {STATUS_TABS.map(tab => (
                        <TabsTrigger key={tab} value={tab} className="capitalize">{tab.replace('_', ' ')}</TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Table */}
            <Card>
                <CardContent className="pt-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[['booking_id', '#'], ['guest_name', 'Guest'], ['room_number', 'Room'], ['room_type', 'Type'], ['check_in', 'Check-in'], ['check_out', 'Check-out'], ['nights', 'Nights'], ['booking_status', 'Status'], ['total_amount', 'Amount']].map(([f, label]) => (
                                    <TableHead key={f} className="cursor-pointer select-none" onClick={() => toggleSort(f)}>
                                        {label} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                                    </TableHead>
                                ))}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sorted.map(b => (
                                <TableRow key={b.booking_id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">#{b.booking_id}</TableCell>
                                    <TableCell className="font-medium">{b.guest_name}</TableCell>
                                    <TableCell>{b.room_number}</TableCell>
                                    <TableCell className="capitalize">{b.room_type}</TableCell>
                                    <TableCell>{formatDate(b.check_in)}</TableCell>
                                    <TableCell>{formatDate(b.check_out)}</TableCell>
                                    <TableCell>{b.nights}</TableCell>
                                    <TableCell><Badge variant={statusVariant[b.booking_status]}>{b.booking_status?.replace('_', ' ')}</Badge></TableCell>
                                    <TableCell className="text-right font-medium">{b.total_amount ? formatCurrency(b.total_amount) : '—'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {b.booking_status === 'confirmed' && (
                                                <>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => handleAction(b.booking_id, 'checkin')} title="Check In"><LogIn size={15} className="text-emerald-600" /></Button>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => handleAction(b.booking_id, 'cancel')} title="Cancel"><XCircle size={15} className="text-red-500" /></Button>
                                                </>
                                            )}
                                            {b.booking_status === 'checked_in' && (
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleAction(b.booking_id, 'checkout')} title="Check Out"><LogOut size={15} className="text-amber-600" /></Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sorted.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No bookings found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* New Booking Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>New Booking</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Guest *</Label>
                            <select required value={form.guest_id} onChange={e => setForm({ ...form, guest_id: e.target.value })} className="mt-1 flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">
                                <option value="">Select a guest...</option>
                                {guests.map(g => <option key={g.guest_id} value={g.guest_id}>{g.first_name} {g.last_name} ({g.email})</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Check-in *</Label><Input required type="date" value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} className="mt-1" /></div>
                            <div><Label>Check-out *</Label><Input required type="date" value={form.check_out} min={form.check_in || undefined} onChange={e => setForm({ ...form, check_out: e.target.value })} className="mt-1" /></div>
                        </div>
                        <div>
                            <Label>Available Room * {availableRooms.length > 0 && <span className="text-emerald-600 font-normal">({availableRooms.length} available)</span>}</Label>
                            <select required value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} disabled={!form.check_in || !form.check_out}
                                className="mt-1 flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm disabled:opacity-50">
                                <option value="">{!form.check_in || !form.check_out ? 'Select dates first...' : 'Select a room...'}</option>
                                {availableRooms.map(r => <option key={r.room_id} value={r.room_id}>Room {r.room_number} — {r.type} — {formatCurrency(r.price_per_night)}/night</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Adults</Label><Input type="number" min="1" value={form.adults} onChange={e => setForm({ ...form, adults: parseInt(e.target.value) || 1 })} className="mt-1" /></div>
                            <div><Label>Children</Label><Input type="number" min="0" value={form.children} onChange={e => setForm({ ...form, children: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                        </div>
                        <div><Label>Special Requests</Label><textarea value={form.special_requests} onChange={e => setForm({ ...form, special_requests: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm resize-none" /></div>
                        <DialogFooter showCloseButton>
                            <Button type="submit">Create Booking</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
