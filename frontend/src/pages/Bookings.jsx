import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getBookings,
  createBooking,
  checkinBooking,
  checkoutBooking,
  cancelBooking,
  getAvailability,
} from '@/api/bookings';
import { getGuests } from '@/api/guests';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LogIn, LogOut, XCircle, Calendar, ArrowRight, Info } from 'lucide-react';

const STATUS_TABS = ['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

const statusVariant = {
  confirmed: 'bg-indigo-950 text-indigo-400 border-indigo-800',
  checked_in: 'bg-green-950 text-green-400 border-green-800',
  checked_out: 'bg-muted/20 text-muted-foreground border-border/50',
  cancelled: 'bg-red-950 text-red-400 border-red-800',
};

const emptyForm = {
  guest_id: '',
  room_id: '',
  check_in: '',
  check_out: '',
  adults: 1,
  children: 0,
  special_requests: '',
};

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

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') params.status = activeTab;
      const res = await getBookings(params);
      setBookings(res.data || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (form.check_in && form.check_out && form.check_out > form.check_in) {
      getAvailability({ check_in: form.check_in, check_out: form.check_out })
        .then((res) => setAvailableRooms(res.data || []))
        .catch(() => toast.error('Failed to check availability'));
    } else {
      setAvailableRooms([]);
    }
  }, [form.check_in, form.check_out, toast]);

  const sorted = useMemo(() => {
    const copy = [...bookings];
    copy.sort((a, b) => {
      const aValue = a[sortField] ?? '';
      const bValue = b[sortField] ?? '';
      if (aValue === bValue) return 0;
      if (sortDir === 'asc') return aValue < bValue ? -1 : 1;
      return aValue > bValue ? -1 : 1;
    });
    return copy;
  }, [bookings, sortDir, sortField]);

  const openNewBooking = async () => {
    setForm(emptyForm);
    setAvailableRooms([]);
    try {
      const res = await getGuests();
      setGuests(res.data || []);
    } catch {
      toast.error('Failed to load guests');
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.check_in && form.check_out && form.check_out > form.check_in) {
      try {
        await createBooking(form);
        toast.success('Booking created');
        setDialogOpen(false);
        await fetchBookings();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to create booking');
      }
    } else {
      toast.error('Check-out must be after check-in');
    }
  };

  const handleAction = async (id, action) => {
    const labels = { checkin: 'Check in', checkout: 'Check out', cancel: 'Cancel' };
    const confirmed = confirm(`${labels[action]} this booking?`);
    if (confirmed) {
      try {
        if (action === 'checkin') await checkinBooking(id);
        else if (action === 'checkout') await checkoutBooking(id);
        else if (action === 'cancel') await cancelBooking(id);
        toast.success(`Booking ${action === 'cancel' ? 'cancelled' : action === 'checkin' ? 'checked in' : 'checked out'}`);
        await fetchBookings();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Action failed');
      }
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  const datesReady = form.check_in && form.check_out;

  return (
    <div className="flex flex-col gap-6 animate-stagger-in pb-12">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-muted-foreground">Transaction Ledger</p>
          <h1 className="text-2xl font-bold tracking-tight">Booking Manifest</h1>
        </div>
        <Button onClick={openNewBooking} size="sm" className="h-8 text-xs font-bold uppercase tracking-widest leading-none">
          <Plus className="mr-2 size-3.5" /> New Placement
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-y border-border/50 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="h-8 bg-muted/20 border border-border/50 p-0.5">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab} 
                className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-sm transition-all"
              >
                {tab.replace('_', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/10 border border-border/30 max-w-md">
          <Info className="size-3 text-muted-foreground" />
          <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60 leading-none">
            Ledger policy: Cancellations allowed only for confirmed status. System archives checkout records.
          </p>
        </div>
      </div>

      <Card className="border-border/50 bg-card/20 shadow-none overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 px-6">Reference / Guest</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Timeline</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Asset / Class</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 text-right px-6">Net Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((booking) => (
                <TableRow key={booking.booking_id} className="border-border/40 hover:bg-muted/10 transition-colors group">
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tabular-nums">ID-{booking.booking_id}</span>
                      <span className="text-xs font-bold">{booking.guest_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[10px] font-mono opacity-80">
                      <span>{formatDate(booking.check_in)}</span>
                      <ArrowRight className="size-2.5 opacity-40" />
                      <span>{formatDate(booking.check_out)}</span>
                      <span className="ml-1 text-[9px] text-muted-foreground">({booking.nights}N)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold tabular-nums">RM {booking.room_number}</span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground opacity-70 leading-none">{booking.room_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest h-5 ${statusVariant[booking.booking_status]}`}>
                        {booking.booking_status?.replace('_', ' ')}
                      </Badge>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {booking.booking_status === 'confirmed' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="xs" 
                              className="h-6 px-2 text-[9px] font-bold uppercase border-green-900/50 text-green-500 hover:bg-green-950/30" 
                              onClick={() => handleAction(booking.booking_id, 'checkin')}
                            >
                              Check-in
                            </Button>
                            <Button 
                              variant="outline" 
                              size="xs" 
                              className="h-6 px-2 text-[9px] font-bold uppercase border-red-900/50 text-red-500 hover:bg-red-950/30" 
                              onClick={() => handleAction(booking.booking_id, 'cancel')}
                            >
                              Revoke
                            </Button>
                          </>
                        )}
                        {booking.booking_status === 'checked_in' && (
                          <Button 
                            variant="outline" 
                            size="xs" 
                            className="h-6 px-2 text-[9px] font-bold uppercase border-indigo-900/50 text-indigo-500 hover:bg-indigo-950/30" 
                            onClick={() => handleAction(booking.booking_id, 'checkout')}
                          >
                            Finalize
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6 text-xs font-bold tabular-nums">
                    {booking.total_amount ? formatCurrency(booking.total_amount) : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground border-none opacity-50 uppercase tracking-[0.2em]">
                    Manifest Empty
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-border/50">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest px-1">Enroll Manifest Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Guest Identity</Label>
                <Select
                  value={form.guest_id}
                  onValueChange={(v) => setForm({ ...form, guest_id: v })}
                  required
                >
                  <SelectTrigger className="h-9 text-xs bg-muted/10 border-border/50 focus:border-foreground/50">
                    <SelectValue placeholder="Locate guest in registry..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {guests.map((g) => (
                      <SelectItem key={g.guest_id} value={g.guest_id.toString()} className="text-xs uppercase font-medium">
                        {g.first_name} {g.last_name} ({g.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Inbound Timeline</Label>
                  <Input
                    required
                    type="date"
                    className="h-9 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono"
                    value={form.check_in}
                    onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Outbound Timeline</Label>
                  <Input
                    required
                    type="date"
                    min={form.check_in || undefined}
                    className="h-9 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono"
                    value={form.check_out}
                    onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Allocated Asset
                  {availableRooms.length > 0 && <span className="ml-2 text-green-500 tracking-tighter">({availableRooms.length} Ready)</span>}
                </Label>
                <Select
                  value={form.room_id}
                  onValueChange={(v) => setForm({ ...form, room_id: v })}
                  disabled={!datesReady}
                  required
                >
                  <SelectTrigger className="h-9 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 disabled:opacity-40">
                    <SelectValue placeholder={datesReady ? 'Select identifier...' : 'Timeline verification required...'} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {availableRooms.map((r) => (
                      <SelectItem key={r.room_id} value={r.room_id.toString()} className="text-xs font-medium uppercase">
                        RM {r.room_number} — {r.type} — {formatCurrency(r.price_per_night)}/N
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Adult Terminals</Label>
                  <Input
                    type="number"
                    min="1"
                    className="h-9 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono text-center"
                    value={form.adults}
                    onChange={(e) => setForm({ ...form, adults: Number(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Child Terminals</Label>
                  <Input
                    type="number"
                    min="0"
                    className="h-9 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono text-center"
                    value={form.children}
                    onChange={(e) => setForm({ ...form, children: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Operational Instructions</Label>
                <Textarea
                  value={form.special_requests}
                  onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                  className="bg-muted/10 border-border/50 focus:border-foreground/50 text-xs min-h-[60px]"
                  placeholder="Additional manifest data..."
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-10 text-[10px] font-bold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all">
              Commit Manifest Entry
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
