import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStaff, createStaff, updateStaff, deactivateStaff } from '@/api/staff';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Pencil, UserX, User, Filter, Mail, Phone } from 'lucide-react';

const ROLES = ['manager', 'receptionist', 'housekeeping', 'maintenance', 'chef'];
const SHIFTS = ['morning', 'evening', 'night'];
const emptyForm = {
  first_name: '',
  last_name: '',
  role: 'receptionist',
  email: '',
  phone: '',
  salary: '',
  shift: 'morning',
  joining_date: '',
};

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

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterRole !== 'all') params.role = filterRole;
      if (filterShift !== 'all') params.shift = filterShift;
      if (filterActive !== 'all') params.is_active = filterActive;
      const res = await getStaff(params);
      setStaffList(res.data || []);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterShift, filterActive, toast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const openAdd = () => {
    setEditingStaff(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (member) => {
    setEditingStaff(member);
    setForm({
      first_name: member.first_name,
      last_name: member.last_name,
      role: member.role,
      email: member.email,
      phone: member.phone || '',
      salary: member.salary || '',
      shift: member.shift || 'morning',
      joining_date: member.joining_date ? member.joining_date.split('T')[0] : '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.staff_id, form);
        toast.success('Staff updated');
      } else {
        await createStaff(form);
        toast.success('Staff added');
      }
      setDialogOpen(false);
      await fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDeactivate = async (id) => {
    const confirmed = confirm('Deactivate this staff member?');
    if (confirmed) {
      try {
        await deactivateStaff(id);
        toast.success('Staff deactivated');
        await fetchStaff();
      } catch {
        toast.error('Failed to deactivate staff');
      }
    }
  };

  const sorted = useMemo(() => {
    const copy = [...staff];
    copy.sort((a, b) => {
      const aValue = a[sortField] ?? '';
      const bValue = b[sortField] ?? '';
      if (aValue === bValue) return 0;
      if (sortDir === 'asc') return aValue < bValue ? -1 : 1;
      return aValue > bValue ? -1 : 1;
    });
    return copy;
  }, [staff, sortDir, sortField]);

  if (loading && staff.length === 0) {
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
          <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-muted-foreground">Internal Directory</p>
          <h1 className="text-2xl font-bold tracking-tight">Personnel Assets</h1>
        </div>
        <Button onClick={openAdd} size="sm" className="h-8 text-xs font-bold uppercase tracking-widest leading-none">
          <Plus className="mr-2 size-3.5" /> Enroll Member
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 border-y border-border/50 py-4 items-center">
        <Filter className="size-3.5 text-muted-foreground mr-1" />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="h-8 w-36 text-[10px] font-bold uppercase tracking-widest bg-muted/20">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-[10px] font-bold uppercase">All Roles</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role} className="text-[10px] font-bold uppercase capitalize">{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterShift} onValueChange={setFilterShift}>
          <SelectTrigger className="h-8 w-32 text-[10px] font-bold uppercase tracking-widest bg-muted/20">
            <SelectValue placeholder="Shift" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-[10px] font-bold uppercase">All Shifts</SelectItem>
            {SHIFTS.map((shift) => (
              <SelectItem key={shift} value={shift} className="text-[10px] font-bold uppercase capitalize">{shift}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="h-8 w-44 text-[10px] font-bold uppercase tracking-widest bg-muted/20">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-[10px] font-bold uppercase">Active & Inactive</SelectItem>
            <SelectItem value="true" className="text-[10px] font-bold uppercase">Active Units</SelectItem>
            <SelectItem value="false" className="text-[10px] font-bold uppercase">Inactive Units</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50 bg-card/20 shadow-none overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 px-6">Identifier / Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Classification</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Contact Channel</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 text-right px-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((member) => (
                <TableRow key={member.staff_id} className="border-border/40 hover:bg-muted/10 transition-colors group">
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tabular-nums">STF-{member.staff_id}</span>
                      <span className="text-xs font-bold">{member.first_name} {member.last_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Badge variant="outline" className={`text-[8px] font-bold uppercase tracking-tighter h-4 w-fit px-1 ${
                        member.role === 'manager' ? 'bg-foreground text-background border-foreground' : 'bg-muted/50'
                      }`}>
                        {member.role}
                      </Badge>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{member.shift} SHIFT</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest h-5 ${
                      member.is_active ? 'bg-green-950 text-green-400 border-green-900/50' : 'bg-muted/20 text-muted-foreground border-border/50'
                    }`}>
                      {member.is_active ? 'Active' : 'Archived'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 font-mono">
                      <div className="flex items-center gap-1.5 opacity-70">
                        <Mail className="size-2.5" />
                        <span className="text-[10px]">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="size-2.5" />
                        <span className="text-[9px]">{member.phone || "—"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(member)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      {member.is_active && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeactivate(member.staff_id)}
                        >
                          <UserX className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground border-none opacity-50 uppercase tracking-[0.2em]">
                    Directory Empty
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-border/50">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest px-1">
              {editingStaff ? 'Modify Personnel Record' : 'Registry Enrollment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Given Name</Label>
                  <Input 
                    required 
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50" 
                    value={form.first_name} 
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Surname</Label>
                  <Input 
                    required 
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50" 
                    value={form.last_name} 
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Classification</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger className="h-8 text-xs bg-muted/10 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs uppercase font-medium">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Shift Rotation</Label>
                  <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                    <SelectTrigger className="h-8 text-xs bg-muted/10 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {SHIFTS.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs uppercase font-medium">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact Link</Label>
                  <Input 
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Remuneration (₹)</Label>
                  <Input 
                    type="number" 
                    className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono" 
                    value={form.salary} 
                    onChange={(e) => setForm({ ...form, salary: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Induction Date</Label>
                <Input 
                  required 
                  type="date" 
                  className="h-8 text-xs bg-muted/10 border-border/50 focus:border-foreground/50 font-mono" 
                  value={form.joining_date} 
                  onChange={(e) => setForm({ ...form, joining_date: e.target.value })} 
                  placeholder="2024-01-01"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-10 text-[10px] font-bold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all">
              {editingStaff ? 'Update Record' : 'Enroll Personnel'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
