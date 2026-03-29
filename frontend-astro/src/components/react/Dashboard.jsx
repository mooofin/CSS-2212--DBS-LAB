import { useState, useEffect } from 'react';
import { getBookings } from '@/api/bookings';
import { getRooms, getRoomSummary } from '@/api/rooms';
import { getRevenueSummary } from '@/api/billing';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    BedDouble, CalendarCheck, IndianRupee,
    LogIn, TrendingUp, TrendingDown, ArrowUpRight
} from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [roomSummary, setRoomSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAll() {
            try {
                const [roomsRes, bookingsRes, revenueRes, summaryRes] = await Promise.all([
                    getRooms(), getBookings(), getRevenueSummary(), getRoomSummary(),
                ]);
                const rooms = roomsRes.data;
                const bookings = bookingsRes.data;
                const revenue = revenueRes.data;
                const today = new Date().toISOString().split('T')[0];

                setStats({
                    totalRooms: rooms.length,
                    available: rooms.filter(r => r.status === 'available').length,
                    occupied: rooms.filter(r => r.status === 'occupied').length,
                    activeBookings: bookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'checked_in').length,
                    todayCheckins: bookings.filter(b => b.check_in?.split('T')[0] === today && (b.booking_status === 'confirmed' || b.booking_status === 'checked_in')).length,
                    totalRevenue: revenue.paid_amount || 0,
                    pendingRevenue: revenue.pending_amount || 0,
                    totalBills: revenue.total_bills || 0,
                });
                setRecentBookings(bookings.slice(0, 8));
                setRoomSummary(summaryRes.data);
            } catch (err) { 
                // Silent fail for dashboard stats - component will show with empty data
            }
            finally { setLoading(false); }
        }
        fetchAll();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full"><div className="spinner" /></div>;

    const occupancyRate = stats?.totalRooms > 0 ? ((stats.occupied / stats.totalRooms) * 100).toFixed(1) : 0;

    const statusVariant = {
        confirmed: 'secondary', checked_in: 'default', checked_out: 'outline', cancelled: 'destructive',
    };

    const roomTypeColors = { 
        single: 'hsl(42, 88%, 58%)', 
        double: 'hsl(28, 85%, 55%)', 
        deluxe: 'hsl(15, 80%, 52%)', 
        suite: 'hsl(200, 70%, 50%)' 
    };

    return (
        <div className="flex flex-1 flex-col gap-6 py-2">
            {/* Premium Page Header */}
            <div className="mb-4">
                <h1 className="text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary mb-2">Dashboard</h1>
                <p className="text-muted-foreground text-sm">Welcome back. Here's what's happening with your hotel today.</p>
            </div>

            {/* Stats Cards - Premium Glass Design */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="stagger-1 border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative z-10">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Revenue</CardDescription>
                        <CardTitle className="text-3xl font-heading font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            {formatCurrency(stats?.totalRevenue || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="border-primary/30 text-primary">
                                <TrendingUp className="size-3.5 mr-1" />
                                +12.5%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-2 text-sm relative z-10">
                        <div className="line-clamp-1 flex gap-2 font-medium text-foreground/80">
                            Revenue from paid bookings <TrendingUp className="size-4" />
                        </div>
                        <div className="text-muted-foreground text-xs">
                            {stats?.totalBills || 0} total bills processed
                        </div>
                    </CardFooter>
                </Card>

        <Card className="stagger-2 border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative z-10">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider">Available Rooms</CardDescription>
                        <CardTitle className="text-3xl font-heading font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            {stats?.available || 0} / {stats?.totalRooms || 0}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="border-primary/30 text-primary">
                                <BedDouble className="size-3.5 mr-1" />
                                {occupancyRate}%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-2 text-sm relative z-10">
                        <div className="line-clamp-1 flex gap-2 font-medium text-foreground/80">
                            {stats?.occupied || 0} rooms currently occupied
                        </div>
                        <div className="text-muted-foreground text-xs">
                            Occupancy rate across all floors
                        </div>
                    </CardFooter>
                </Card>

        <Card className="stagger-3 border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative z-10">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider">Active Bookings</CardDescription>
                        <CardTitle className="text-3xl font-heading font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            {stats?.activeBookings || 0}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="border-primary/30 text-primary">
                                <CalendarCheck className="size-3.5 mr-1" />
                                Active
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-2 text-sm relative z-10">
                        <div className="line-clamp-1 flex gap-2 font-medium text-foreground/80">
                            {stats?.todayCheckins || 0} check-ins scheduled today <LogIn className="size-4" />
                        </div>
                        <div className="text-muted-foreground text-xs">
                            Confirmed and checked-in bookings
                        </div>
                    </CardFooter>
                </Card>

        <Card className="stagger-4 border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative z-10">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider">Pending Amount</CardDescription>
                        <CardTitle className="text-3xl font-heading font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            {formatCurrency(stats?.pendingRevenue || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="border-primary/30 text-primary">
                                {stats?.pendingRevenue > 0 ? <TrendingDown className="size-3.5 mr-1" /> : <TrendingUp className="size-3.5 mr-1" />}
                                Pending
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-2 text-sm relative z-10">
                        <div className="line-clamp-1 flex gap-2 font-medium text-foreground/80">
                            Awaiting payment collection <IndianRupee className="size-4" />
                        </div>
                        <div className="text-muted-foreground text-xs">
                            Outstanding bills to be settled
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Room Distribution - Enhanced */}
            <div>
        <Card className="stagger-5 border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-heading">Room Distribution</CardTitle>
                        <CardDescription className="text-sm">Availability breakdown by room type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {roomSummary.map(rs => {
                                const total = roomSummary.reduce((s, r) => s + r.total_rooms, 0);
                                const pct = total > 0 ? (rs.total_rooms / total * 100).toFixed(0) : 0;
                                return (
                                    <div key={rs.type} className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-semibold capitalize text-foreground">{rs.type}</span>
                                            <span className="text-muted-foreground font-medium">{rs.total_rooms} rooms</span>
                                        </div>
                                        <div className="w-full bg-muted/40 rounded-full h-3 overflow-hidden border border-primary/10">
                                            <div className="h-full rounded-full transition-all duration-700 shadow-lg shadow-primary/20"
                                                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${roomTypeColors[rs.type]}, ${roomTypeColors[rs.type]}dd)` }} />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                                                {rs.available} available
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-muted-foreground/40"></span>
                                                {rs.occupied} occupied
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bookings - Premium Table */}
            <div>
                <Card className="stagger-6 border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-heading">Recent Bookings</CardTitle>
                        <CardDescription className="text-sm">Latest booking activity across all rooms</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-primary/10 hover:bg-transparent">
                                    <TableHead className="font-semibold text-foreground/70">Guest</TableHead>
                                    <TableHead className="font-semibold text-foreground/70">Room</TableHead>
                                    <TableHead className="font-semibold text-foreground/70">Type</TableHead>
                                    <TableHead className="font-semibold text-foreground/70">Check-in</TableHead>
                                    <TableHead className="font-semibold text-foreground/70">Check-out</TableHead>
                                    <TableHead className="font-semibold text-foreground/70">Status</TableHead>
                                    <TableHead className="text-right font-semibold text-foreground/70">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.map(b => (
                                    <TableRow key={b.booking_id} className="border-primary/5 hover:bg-primary/5 transition-colors">
                                        <TableCell className="font-semibold">{b.guest_name}</TableCell>
                                        <TableCell className="font-medium text-primary">{b.room_number}</TableCell>
                                        <TableCell className="capitalize text-muted-foreground">{b.room_type}</TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(b.check_in)}</TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(b.check_out)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[b.booking_status] || 'outline'} className="font-medium">
                                                {b.booking_status?.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold tabular-nums text-primary">
                                            {b.total_amount ? formatCurrency(b.total_amount) : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {recentBookings.length === 0 && (
                                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12 font-medium">No bookings yet</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
