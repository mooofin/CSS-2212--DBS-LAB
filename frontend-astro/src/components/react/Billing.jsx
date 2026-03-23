import { useState, useEffect } from 'react';
import { getBills, payBill, getRevenueSummary } from '@/api/billing';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { IndianRupee, TrendingUp, Clock, CreditCard } from 'lucide-react';

const PAYMENT_METHODS = ['cash', 'card', 'upi', 'bank_transfer'];

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

    const fetchData = async () => {
        try {
            const [billsRes, revenueRes] = await Promise.all([getBills(), getRevenueSummary()]);
            setBills(billsRes.data);
            setRevenue(revenueRes.data);
        } catch { toast.error('Failed to load billing data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openPay = (bill) => { setSelectedBill(bill); setPaymentMethod(''); setPayDialogOpen(true); };

    const handlePay = async (e) => {
        e.preventDefault();
        try {
            await payBill(selectedBill.bill_id, { payment_method: paymentMethod });
            toast.success('Payment recorded');
            setPayDialogOpen(false); fetchData();
        } catch (err) { toast.error(err.response?.data?.error || 'Payment failed'); }
    };

    const sorted = [...bills].sort((a, b) => {
        const av = a[sortField] ?? '', bv = b[sortField] ?? '';
        return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });

    const toggleSort = (f) => {
        if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(f); setSortDir('asc'); }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="spinner" /></div>;

    const revenueCards = [
        { label: 'Total Revenue', value: formatCurrency(revenue?.total_revenue || 0), icon: IndianRupee, gradient: 'from-blue-500 to-blue-700' },
        { label: 'Paid', value: formatCurrency(revenue?.paid_amount || 0), icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-700' },
        { label: 'Pending', value: formatCurrency(revenue?.pending_amount || 0), icon: Clock, gradient: 'from-amber-500 to-amber-700' },
        { label: 'Total Bills', value: revenue?.total_bills || 0, icon: CreditCard, gradient: 'from-violet-500 to-violet-700' },
    ];

    return (
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
                <h1 className="text-2xl font-semibold">Billing</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Revenue tracking and payment management</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {revenueCards.map((card, i) => (
                    <Card key={i}>
                        <CardContent className="pt-0">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm mb-3`}>
                                <card.icon size={16} className="text-white" />
                            </div>
                            <p className="text-xl font-bold">{card.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardContent className="pt-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[['bill_id', 'Bill #'], ['guest_name', 'Guest'], ['room_number', 'Room'], ['nights', 'Nights'], ['room_charges', 'Room Charges'], ['tax_amount', 'Tax (18%)'], ['service_charges', 'Service'], ['total_amount', 'Total'], ['payment_status', 'Status']].map(([f, label]) => (
                                    <TableHead key={f} className="cursor-pointer select-none" onClick={() => toggleSort(f)}>
                                        {label} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                                    </TableHead>
                                ))}
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sorted.map(b => (
                                <TableRow key={b.bill_id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">#{b.bill_id}</TableCell>
                                    <TableCell className="font-medium">{b.guest_name}</TableCell>
                                    <TableCell>{b.room_number}</TableCell>
                                    <TableCell>{b.nights}</TableCell>
                                    <TableCell>{formatCurrency(b.room_charges)}</TableCell>
                                    <TableCell className="text-muted-foreground">{formatCurrency(b.tax_amount)}</TableCell>
                                    <TableCell className="text-muted-foreground">{formatCurrency(b.service_charges)}</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(b.total_amount)}</TableCell>
                                    <TableCell>
                                        <Badge variant={b.payment_status === 'paid' ? 'default' : b.payment_status === 'pending' ? 'secondary' : 'destructive'}>
                                            {b.payment_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {b.payment_status === 'pending' && (
                                            <Button variant="outline" size="sm" onClick={() => openPay(b)}>Mark Paid</Button>
                                        )}
                                        {b.payment_status === 'paid' && (
                                            <span className="text-xs text-muted-foreground">{b.payment_method} • {formatDate(b.paid_at)}</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sorted.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No bills found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pay Dialog */}
            <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
                    {selectedBill && (
                        <form onSubmit={handlePay} className="space-y-4">
                            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Guest</span><span className="font-medium">{selectedBill.guest_name}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span>{selectedBill.room_number}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Room Charges</span><span>{formatCurrency(selectedBill.room_charges)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Tax (18%)</span><span>{formatCurrency(selectedBill.tax_amount)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span>{formatCurrency(selectedBill.service_charges)}</span></div>
                                <Separator />
                                <div className="flex justify-between text-base"><span className="font-semibold">Total</span><span className="font-bold">{formatCurrency(selectedBill.total_amount)}</span></div>
                            </div>
                            <div>
                                <Label>Payment Method *</Label>
                                <select required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                                    className="mt-1 flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">
                                    <option value="">Select method...</option>
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m} className="capitalize">{m.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <DialogFooter showCloseButton>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Confirm Payment</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
