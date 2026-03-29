import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '@/api/rooms';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
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
import { Plus, Pencil, Trash2, LayoutGrid, List, Bed, Search, Filter } from 'lucide-react';

const ROOM_TYPES = ['single', 'double', 'suite', 'deluxe'];
const STATUSES = ['available', 'occupied', 'maintenance'];

const statusVariant = {
  available: 'bg-green-950 text-green-400 border-green-800',
  occupied: 'bg-indigo-950 text-indigo-400 border-indigo-800',
  maintenance: 'bg-muted/30 text-muted-foreground border-border',
};

const emptyForm = {
  room_number: '',
  type: 'single',
  price_per_night: '',
  status: 'available',
  floor: '',
  max_occupancy: '',
  amenities: '',
};

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

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterType !== 'all') params.type = filterType;
      const res = await getRooms(params);
      setRooms(res.data || []);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, toast]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const sorted = useMemo(() => {
    const copy = [...rooms];
    copy.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue === bValue) return 0;
      if (sortDir === 'asc') return aValue < bValue ? -1 : 1;
      return aValue > bValue ? -1 : 1;
    });
    return copy;
  }, [rooms, sortDir, sortField]);

  const openAdd = () => {
    setEditingRoom(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (room) => {
    setEditingRoom(room);
    setForm({
      room_number: room.room_number,
      type: room.type,
      price_per_night: room.price_per_night,
      status: room.status,
      floor: room.floor,
      max_occupancy: room.max_occupancy,
      amenities: room.amenities || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.room_id, form);
        toast.success('Room updated');
      } else {
        await createRoom(form);
        toast.success('Room created');
      }
      setDialogOpen(false);
      await fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Set this room to maintenance?')) return;
    try {
      await deleteRoom(id);
      toast.success('Room set to maintenance');
      await fetchRooms();
    } catch {
      toast.error('Failed to update room');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-stagger-in">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-muted-foreground">Inventory Control</p>
          <h1 className="text-2xl font-bold tracking-tight">Room Assets</h1>
        </div>
        <Button onClick={openAdd} size="sm" className="h-8 text-xs font-bold uppercase tracking-widest">
          <Plus className="mr-2 size-3.5" /> New Registry
        </Button>
      </div>

      <div className="flex flex-col gap-4 border-y border-border/50 py-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-36 text-[10px] font-bold uppercase tracking-widest bg-muted/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase tracking-widest capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-8 w-36 text-[10px] font-bold uppercase tracking-widest bg-muted/20">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Types</SelectItem>
              {ROOM_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="text-[10px] font-bold uppercase tracking-widest capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex h-8 items-center rounded-md border border-border/50 bg-muted/20 p-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode('table')}
            >
              <List className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card className="border-border/50 bg-card/20 shadow-none overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 px-6">Room</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Classification</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 text-center">Floor</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 text-center">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 text-right px-6">Price/Night</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((room) => (
                  <TableRow 
                    key={room.room_id} 
                    className="border-border/40 hover:bg-muted/10 transition-colors group cursor-pointer"
                    onClick={() => openEdit(room)}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 items-center justify-center rounded bg-muted/50 border border-border/50">
                          <Bed className="size-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-xs font-bold tabular-nums">RM {room.room_number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                      {room.type}
                    </TableCell>
                    <TableCell className="text-center text-xs font-medium tabular-nums opacity-60">
                      {room.floor}
                    </TableCell>
                    <TableCell className="text-center px-0">
                      <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-[0.1em] h-5 ${statusVariant[room.status]}`}>
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 text-xs font-bold tabular-nums">
                      {formatCurrency(room.price_per_night)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((room) => (
            <Card 
              key={room.room_id} 
              className="group border-border/60 bg-card/40 transition-all hover:border-border hover:bg-muted/5 cursor-pointer overflow-hidden"
              onClick={() => openEdit(room)}
            >
              <div className="h-32 bg-muted/20 border-b border-border/30 flex items-center justify-center relative">
                <Bed className="size-8 text-muted-foreground/30" />
                <Badge variant="outline" className={`absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest ${statusVariant[room.status]}`}>
                  {room.status}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold tracking-tight">ROOM {room.room_number}</h3>
                  <span className="text-xs font-bold tabular-nums">{formatCurrency(room.price_per_night)}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  <span>{room.type}</span>
                  <span>•</span>
                  <span>FL {room.floor}</span>
                  <span>•</span>
                  <span>MAX {room.max_occupancy}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-border/50">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest px-1">
              {editingRoom ? 'Modify Record' : 'Registry Entry'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Room ID</Label>
                  <Input
                    required
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono"
                    placeholder="201"
                    value={form.room_number}
                    onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {ROOM_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs uppercase font-medium">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rate (₹)</Label>
                  <Input
                    required
                    type="number"
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono"
                    value={form.price_per_night}
                    onChange={(e) => setForm({ ...form, price_per_night: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs uppercase font-medium">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Floor</Label>
                  <Input
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono text-center"
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Max Capacity</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono text-center"
                    value={form.max_occupancy}
                    onChange={(e) => setForm({ ...form, max_occupancy: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {editingRoom && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest border-red-900/50 text-red-500 hover:bg-red-950/30"
                  onClick={() => handleDelete(editingRoom.room_id)}
                >
                  <Trash2 className="mr-2 size-3.5" /> Maintenance
                </Button>
              )}
              <Button type="submit" className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all">
                {editingRoom ? 'Commit Changes' : 'Process Entry'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
