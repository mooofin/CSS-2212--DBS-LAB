import { useCallback, useEffect, useMemo, useState } from 'react';
import { getBills, getRevenueSummary, payBill } from '@/api/billing';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IndianRupee, TrendingUp, Clock, CreditCard, Receipt, MoreHorizontal, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [sortField, setSortField] = useState('bill_id');
  const [sortDir, setSortDir] = useState('desc');
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [billsRes, revenueRes] = await Promise.all([getBills(), getRevenueSummary()]);
      setBills(billsRes.data || []);
      setRevenue(revenueRes.data || null);
    } catch {
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePay = async (event) => {
    event.preventDefault();
    if (paymentMethod === '') {
      toast.error('Choose a payment method');
      return;
    }
    if (selectedBill) {
      try {
        await payBill(selectedBill.bill_id, { payment_method: paymentMethod });
        toast.success('Payment recorded');
        setPayDialogOpen(false);
        setPaymentMethod('');
        await fetchData();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Payment failed');
      }
    }
  };

  const sorted = useMemo(() => {
    const copy = [...bills];
    copy.sort((a, b) => {
      const aValue = a[sortField] ?? '';
      const bValue = b[sortField] ?? '';
      if (aValue === bValue) return 0;
      if (sortDir === 'asc') return aValue < bValue ? -1 : 1;
      return aValue > bValue ? -1 : 1;
    });
    return copy;
  }, [bills, sortDir, sortField]);

  if (loading && bills.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  const revenueStats = [
    { label: 'Gross Revenue', value: revenue?.total_revenue || 0, icon: IndianRupee },
    { label: 'Settled', value: revenue?.paid_amount || 0, icon: TrendingUp },
    { label: 'Outstanding', value: revenue?.pending_amount || 0, icon: Clock },
    { label: 'Invoices', value: revenue?.total_bills || 0, icon: Receipt, isCount: true },
  ];

  return (
    <div className="flex flex-col gap-6 animate-stagger-in pb-12">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-muted-foreground">Financial Ledger</p>
        <h1 className="text-2xl font-bold tracking-tight">Revenue Operations</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueStats.map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/20 shadow-none">
            <CardContent className="p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 opacity-60">
                <stat.icon className="size-3" />
                <span className="text-[10px] uppercase font-bold tracking-widest">{stat.label}</span>
              </div>
              <p className="text-lg font-bold font-mono tracking-tight">
                {stat.isCount ? stat.value : formatCurrency(stat.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-950/10 border border-indigo-900/30">
        <ShieldCheck className="size-3.5 text-indigo-400" />
        <p className="text-[9px] uppercase font-bold tracking-widest text-indigo-300">
          Compliance Note: All transactions are cryptographically signed and archived for audit. Ledger is immutable once closed.
        </p>
      </div>

      <Card className="border-border/50 bg-card/20 shadow-none overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 px-6">Invoice ID / Guest</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Operational Context</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Settlement Data</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 text-right px-6">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((bill) => (
                <TableRow key={bill.bill_id} className="border-border/40 hover:bg-muted/10 transition-colors group">
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tabular-nums">INV-{bill.bill_id}</span>
                      <span className="text-xs font-bold">{bill.guest_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-foreground leading-none">RM {bill.room_number}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{bill.nights} CYCLES</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest h-5 ${
                      bill.payment_status === 'paid' 
                        ? 'bg-green-950 text-green-400 border-green-900/50' 
                        : 'bg-amber-950 text-amber-400 border-amber-900/50'
                    }`}>
                      {bill.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bill.payment_status === 'paid' ? (
                      <div className="flex flex-col gap-0.5 font-mono opacity-70">
                        <span className="text-[10px] font-bold uppercase">{bill.payment_method}</span>
                        <span className="text-[9px]">{formatDate(bill.paid_at)}</span>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="xs" 
                        className="h-6 px-3 text-[9px] font-bold uppercase border-indigo-900/50 text-indigo-400 hover:bg-indigo-950/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setSelectedBill(bill);
                          setPayDialogOpen(true);
                        }}
                      >
                        Settle Now
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-6 text-xs font-bold font-mono tracking-tight grayscale group-hover:grayscale-0 transition-all">
                    {formatCurrency(bill.total_amount)}
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground border-none opacity-50 uppercase tracking-[0.2em]">
                    No Revenue Records
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-border/50">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest px-1">Settlement Processor</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <form onSubmit={handlePay} className="p-6 pt-4 space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-muted/10 border border-border/50 divide-y divide-border/30">
                  <div className="flex justify-between py-1.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Entity</span>
                    <span className="text-[11px] font-bold">{selectedBill.guest_name}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Asset Charge</span>
                    <span className="text-[11px] font-mono">{formatCurrency(selectedBill.room_charges)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Levy (18%)</span>
                    <span className="text-[11px] font-mono">{formatCurrency(selectedBill.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 pt-3 mt-1.5 border-t border-border/60">
                    <span className="text-[11px] font-bold uppercase">Total Settlement</span>
                    <span className="text-sm font-bold font-mono">{formatCurrency(selectedBill.total_amount)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Transfer Protocol</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                    <SelectTrigger className="h-9 text-xs bg-muted/10 border-border/50 focus:border-foreground/50">
                      <SelectValue placeholder="Select method..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {['cash', 'card', 'upi', 'bank_transfer'].map((method) => (
                        <SelectItem key={method} value={method} className="text-xs uppercase font-medium">
                          {method.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full h-10 text-[10px] font-bold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all">
                Execute Settlement
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
