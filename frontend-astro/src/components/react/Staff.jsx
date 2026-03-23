import { useState, useEffect } from 'react';
import { getStaff, createStaff, updateStaff, deactivateStaff } from '@/api/staff';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, UserX } from 'lucide-react';

const ROLES = ['manager', 'receptionist', 'housekeeping', 'maintenance', 'chef'];
const SHIFTS = ['morning', 'evening', 'night'];
const emptyForm = { first_name: '', last_name: '', role: 'receptionist', email: '', phone: '', salary: '', shift: 'morning', joining_date: '' };

export default function Staff() {
    const [staff, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('all');
    const [filterShift, setFilterShift] = useState('all');
    const [filterActive, setFilterActive] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [sortField, setSortField] = useState('first_name');
    const [sortDir, setSortDir] = useState('asc');
    const toast = useToast();

    const fetchStaff = async () => {
        try {
            const params = {};
            if (filterRole && filterRole !== 'all') params.role = filterRole;
            if (filterShift && filterShift !== 'all') params.shift = filterShift;
            if (filterActive !== 'all') params.is_active = filterActive;
            setStaffList((await getStaff(params)).data);
        } catch { toast.error('Failed to load staff'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStaff(); }, [filterRole, filterShift, filterActive]);

    const openAdd = () => { setEditingStaff(null); setForm(emptyForm); setDialogOpen(true); };
    const openEdit = (s) => {
        setEditingStaff(s);
        setForm({ first_name: s.first_name, last_name: s.last_name, role: s.role, email: s.email, phone: s.phone || '', salary: s.salary || '', shift: s.shift || 'morning', joining_date: s.joining_date ? s.joining_date.split('T')[0] : '' });
        setDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStaff) { await updateStaff(editingStaff.staff_id, form); toast.success('Staff updated'); }
            else { await createStaff(form); toast.success('Staff added'); }
            setDialogOpen(false); fetchStaff();
        } catch (err) { toast.error(err.response?.data?.error || 'Operation failed'); }
    };

    const handleDeactivate = async (id) => {
        if (!confirm('Deactivate this staff member?')) return;
        try { await deactivateStaff(id); toast.success('Staff deactivated'); fetchStaff(); }
        catch { toast.error('Failed to deactivate staff'); }
    };

    const sorted = [...staff].sort((a, b) => {
        const av = a[sortField] ?? '', bv = b[sortField] ?? '';
        return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });

    const toggleSort = (f) => {
        if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(f); setSortDir('asc'); }
    };

    const roleVariant = { manager: 'default', receptionist: 'secondary', housekeeping: 'outline', maintenance: 'outline', chef: 'secondary' };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="spinner" /></div>;

    return (
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-semibold">Staff</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">{staff.length} staff members</p>
                </div>
                <Button onClick={openAdd}><Plus size={16} /> Add Staff</Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 px-4 lg:px-6">
                <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterShift} onValueChange={setFilterShift}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Shifts" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Shifts</SelectItem>
                        {SHIFTS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterActive} onValueChange={setFilterActive}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Active & Inactive" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Active & Inactive</SelectItem>
                        <SelectItem value="true">Active Only</SelectItem>
                        <SelectItem value="false">Inactive Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardContent className="pt-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[['first_name', 'Name'], ['role', 'Role'], ['email', 'Email'], ['phone', 'Phone'], ['shift', 'Shift'], ['salary', 'Salary'], ['joining_date', 'Joined'], ['is_active', 'Status']].map(([f, label]) => (
                                    <TableHead key={f} className="cursor-pointer select-none" onClick={() => toggleSort(f)}>
                                        {label} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                                    </TableHead>
                                ))}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sorted.map(s => (
                                <TableRow key={s.staff_id} className={!s.is_active ? 'opacity-50' : ''}>
                                    <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                                    <TableCell><Badge variant={roleVariant[s.role]} className="capitalize">{s.role}</Badge></TableCell>
                                    <TableCell>{s.email}</TableCell>
                                    <TableCell>{s.phone || '—'}</TableCell>
                                    <TableCell className="capitalize">{s.shift || '—'}</TableCell>
                                    <TableCell className="font-medium">{s.salary ? formatCurrency(s.salary) : '—'}</TableCell>
                                    <TableCell>{formatDate(s.joining_date)}</TableCell>
                                    <TableCell>
                                        <Badge variant={s.is_active ? 'default' : 'outline'}>{s.is_active ? 'Active' : 'Inactive'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)}><Pencil size={15} /></Button>
                                            {s.is_active && (
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleDeactivate(s.staff_id)} title="Deactivate"><UserX size={15} /></Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sorted.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No staff found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>{editingStaff ? 'Edit Staff' : 'Add Staff Member'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>First Name *</Label><Input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="mt-1" /></div>
                            <div><Label>Last Name *</Label><Input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="mt-1" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Role *</Label>
                                <select required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="mt-1 flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Shift</Label>
                                <select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })} className="mt-1 flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">
                                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div><Label>Email *</Label><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
                            <div><Label>Salary (₹)</Label><Input type="number" min="0" step="0.01" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="mt-1" /></div>
                        </div>
                        <div><Label>Joining Date *</Label><Input required type="date" value={form.joining_date} onChange={e => setForm({ ...form, joining_date: e.target.value })} className="mt-1" /></div>
                        <DialogFooter showCloseButton>
                            <Button type="submit">{editingStaff ? 'Save Changes' : 'Add Staff'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
