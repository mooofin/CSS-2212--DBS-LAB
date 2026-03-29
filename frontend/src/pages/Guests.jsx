import { useCallback, useEffect, useMemo, useState } from 'react';
import { getGuests, getGuest, createGuest, updateGuest, deleteGuest } from '@/api/guests';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, Trash2, Search, Eye, X, User, ChevronRight } from 'lucide-react';

const ID_TYPES = ['passport', 'aadhar', 'driving_license', 'pan'];
const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  id_type: 'passport',
  id_number: '',
};

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

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await getGuests(params);
      setGuests(res.data || []);
    } catch {
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchGuests();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchGuests]);

  const sorted = useMemo(() => {
    const copy = [...guests];
    copy.sort((a, b) => {
      const aValue = a[sortField] ?? '';
      const bValue = b[sortField] ?? '';
      if (aValue === bValue) return 0;
      if (sortDir === 'asc') return aValue < bValue ? -1 : 1;
      return aValue > bValue ? -1 : 1;
    });
    return copy;
  }, [guests, sortDir, sortField]);

  const openAdd = () => {
    setEditingGuest(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (guest) => {
    setEditingGuest(guest);
    setForm({
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone: guest.phone || '',
      address: guest.address || '',
      id_type: guest.id_type || 'passport',
      id_number: guest.id_number || '',
    });
    setDialogOpen(true);
  };

  const showHistory = async (guest) => {
    try {
      const res = await getGuest(guest.guest_id);
      setSelectedGuest(res.data);
    } catch {
      toast.error('Failed to load guest details');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingGuest) {
        await updateGuest(editingGuest.guest_id, form);
        toast.success('Guest updated');
      } else {
        await createGuest(form);
        toast.success('Guest added');
      }
      setDialogOpen(false);
      await fetchGuests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this guest?')) return;
    try {
      await deleteGuest(id);
      toast.success('Guest deleted');
      await fetchGuests();
      if (selectedGuest?.guest_id === id) setSelectedGuest(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot delete guest');
    }
  };

  if (loading && guests.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-stagger-in pb-12">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-muted-foreground">Personnel Registry</p>
          <h1 className="text-2xl font-bold tracking-tight">Active Guests</h1>
        </div>
        <Button onClick={openAdd} size="sm" className="h-8 text-xs font-bold uppercase tracking-widest leading-none">
          <Plus className="mr-2 size-3.5" /> New Registry
        </Button>
      </div>

      <Card className="border-border/40 bg-card/20 shadow-none">
        <CardContent className="p-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by identity, contact, or nomenclature..."
              className="h-9 w-full border-none bg-transparent pl-9 text-xs focus-visible:ring-0 placeholder:text-muted-foreground/40 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <Card className="border-border/50 bg-card/20 shadow-none overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 px-6 w-52">Guest Nomenclature</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Contact Channel</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Identity Verified</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 text-right px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((guest) => (
                    <TableRow 
                      key={guest.guest_id} 
                      className={`border-border/40 hover:bg-muted/10 transition-colors group cursor-pointer ${
                        selectedGuest?.guest_id === guest.guest_id ? 'bg-muted/20' : ''
                      }`}
                      onClick={() => showHistory(guest)}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-7 border border-border/50 rounded bg-muted/50">
                            <AvatarFallback className="text-[10px] font-bold opacity-70">
                              {guest.first_name[0]}{guest.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold">{guest.first_name} {guest.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 font-mono">
                          <span className="text-[10px] opacity-70 leading-none">{guest.email}</span>
                          <span className="text-[9px] text-muted-foreground leading-none">{guest.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {guest.id_number ? (
                          <Badge variant="outline" className="text-[9px] font-bold bg-green-950/20 text-green-400 border-green-900/50 uppercase tracking-tighter">
                            Verified / {guest.id_type}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] font-bold bg-muted/20 text-muted-foreground border-border uppercase tracking-tighter">
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={(e) => { e.stopPropagation(); openEdit(guest); }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDelete(guest.guest_id); }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                          <ChevronRight className="size-3.5 text-muted-foreground ml-1" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sorted.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground border-none opacity-50 uppercase tracking-[0.2em]">
                        No matches in registry
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {selectedGuest && (
          <div className="w-full lg:w-80 space-y-4">
            <Card className="border-border/60 bg-card/30 shadow-2xl sticky top-20 overflow-hidden">
              <div className="h-1 bg-foreground/10" />
              <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Guest Profile</p>
                <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-foreground" onClick={() => setSelectedGuest(null)}>
                  <X className="size-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-6">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">{selectedGuest.first_name} {selectedGuest.last_name}</h2>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">ID: {selectedGuest.guest_id}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground/60">Email Address</Label>
                    <p className="text-xs font-mono break-all">{selectedGuest.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground/60">Phone Terminal</Label>
                    <p className="text-xs font-mono">{selectedGuest.phone || "—"}</p>
                  </div>
                  {selectedGuest.id_number && (
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-bold text-muted-foreground/60">Identity Document</Label>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold">{selectedGuest.id_type?.replace('_', ' ')}</span>
                        <span className="text-xs font-mono">{selectedGuest.id_number}</span>
                      </div>
                    </div>
                  )}
                  {selectedGuest.address && (
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-bold text-muted-foreground/60">Residence</Label>
                      <p className="text-xs">{selectedGuest.address}</p>
                    </div>
                  )}
                </div>

                <Separator className="bg-border/30" />

                <div className="space-y-4">
                  <Label className="text-[9px] uppercase font-bold text-muted-foreground/60">Recent Ledger</Label>
                  {selectedGuest.bookings?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedGuest.bookings.slice(0, 3).map((b) => (
                        <div key={b.booking_id} className="p-2 rounded bg-muted/20 border border-border/20 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase">Room {b.room_number}</span>
                            <span className={`text-[8px] font-bold uppercase px-1 rounded-sm ${
                              b.status === 'confirmed' ? 'bg-indigo-950 text-indigo-400' : 
                              b.status === 'checked_in' ? 'bg-green-950 text-green-400' : 
                              'bg-muted text-muted-foreground'
                            }`}>
                              {b.status === 'checked_out' ? 'archived' : b.status}
                            </span>
                          </div>
                          <p className="text-[9px] text-muted-foreground font-mono">
                            {formatDate(b.check_in)} — {formatDate(b.check_out)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic">No booking activity recorded.</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full h-8 text-[10px] font-bold uppercase tracking-widest" onClick={() => openEdit(selectedGuest)}>Edit Record</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-border/50">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest px-1">
              {editingGuest ? 'Modify Personnel Record' : 'Registry Enrollment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                  <Input 
                    required 
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50" 
                    value={form.first_name} 
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                  <Input 
                    required 
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50" 
                    value={form.last_name} 
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Primary Email Address</Label>
                <Input 
                  required 
                  type="email" 
                  className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                  <Input 
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID Classification</Label>
                  <Select value={form.id_type} onValueChange={(v) => setForm({ ...form, id_type: v })}>
                    <SelectTrigger className="h-8 text-xs bg-muted/10 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {ID_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs uppercase font-medium">{t.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Identity Reference ID</Label>
                <Input 
                  className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono" 
                  value={form.id_number} 
                  onChange={(e) => setForm({ ...form, id_number: e.target.value })} 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Residential Address</Label>
                <Input 
                  className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50" 
                  value={form.address} 
                  onChange={(e) => setForm({ ...form, address: e.target.value })} 
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-9 text-[10px] font-bold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all">
              {editingGuest ? 'Update Record' : 'Enroll Personnel'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
