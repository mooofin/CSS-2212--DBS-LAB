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
            } catch (err) { console.error('Dashboard fetch error:', err); }
            finally { setLoading(false); }
        }
        fetchAll();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full"><div className="spinner" /></div>;

    const occupancyRate = stats?.totalRooms > 0 ? ((stats.occupied / stats.totalRooms) * 100).toFixed(1) : 0;

    const statusVariant = {
        confirmed: 'secondary', checked_in: 'default', checked_out: 'outline', cancelled: 'destructive',
    };

    const roomTypeColors = { single: 'hsl(var(--primary))', double: 'hsl(36, 60%, 40%)', deluxe: 'hsl(25, 70%, 45%)', suite: 'hsl(150, 40%, 35%)' };

    return (
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Section Cards - matching shadcn pattern */}
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 xl:grid-cols-4">
        <Card className="stagger-1">
                    <CardHeader>
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums">
                            {formatCurrency(stats?.totalRevenue || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <TrendingUp className="size-3" />
                                +12.5%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Revenue from paid bookings <TrendingUp className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            {stats?.totalBills || 0} total bills processed
                        </div>
                    </CardFooter>
                </Card>

        <Card className="stagger-2">
                    <CardHeader>
                        <CardDescription>Available Rooms</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums">
                            {stats?.available || 0} / {stats?.totalRooms || 0}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <BedDouble className="size-3" />
                                {occupancyRate}%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {stats?.occupied || 0} rooms currently occupied
                        </div>
                        <div className="text-muted-foreground">
                            Occupancy rate across all floors
                        </div>
                    </CardFooter>
                </Card>

        <Card className="stagger-3">
                    <CardHeader>
                        <CardDescription>Active Bookings</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums">
                            {stats?.activeBookings || 0}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <CalendarCheck className="size-3" />
                                Active
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {stats?.todayCheckins || 0} check-ins scheduled today <LogIn className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Confirmed and checked-in bookings
                        </div>
                    </CardFooter>
                </Card>

        <Card className="stagger-4">
                    <CardHeader>
                        <CardDescription>Pending Amount</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums">
                            {formatCurrency(stats?.pendingRevenue || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                {stats?.pendingRevenue > 0 ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                                Pending
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Awaiting payment collection <IndianRupee className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Outstanding bills to be settled
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Room Distribution */}
            <div className="px-4 lg:px-6">
        <Card className="stagger-5">
                    <CardHeader>
                        <CardTitle>Room Distribution</CardTitle>
                        <CardDescription>Availability breakdown by room type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {roomSummary.map(rs => {
                                const total = roomSummary.reduce((s, r) => s + r.total_rooms, 0);
                                const pct = total > 0 ? (rs.total_rooms / total * 100).toFixed(0) : 0;
                                return (
                                    <div key={rs.type} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium capitalize">{rs.type}</span>
                                            <span className="text-muted-foreground">{rs.total_rooms} rooms</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, backgroundColor: roomTypeColors[rs.type] || 'hsl(var(--primary))' }} />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{rs.available} available</span>
                                            <span>{rs.occupied} occupied</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bookings */}
            <div className="px-4 lg:px-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>Latest booking activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Guest</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Check-in</TableHead>
                                    <TableHead>Check-out</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.map(b => (
                                    <TableRow key={b.booking_id}>
                                        <TableCell className="font-medium">{b.guest_name}</TableCell>
                                        <TableCell>{b.room_number}</TableCell>
                                        <TableCell className="capitalize">{b.room_type}</TableCell>
                                        <TableCell>{formatDate(b.check_in)}</TableCell>
                                        <TableCell>{formatDate(b.check_out)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[b.booking_status] || 'outline'}>
                                                {b.booking_status?.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            {b.total_amount ? formatCurrency(b.total_amount) : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {recentBookings.length === 0 && (
                                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No bookings yet</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
