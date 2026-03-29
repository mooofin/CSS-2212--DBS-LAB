import { useEffect, useMemo, useState } from 'react';
import { getBookings } from '@/api/bookings';
import { getRooms, getRoomSummary } from '@/api/rooms';
import { getRevenueSummary } from '@/api/billing';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  IndianRupee,
  BedDouble,
  CalendarCheck,
  TrendingDown,
  TrendingUp,
  LogIn,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';

const statusVariant = {
  confirmed: 'border-indigo-800 text-indigo-400 bg-indigo-950',
  checked_in: 'border-green-800 text-green-400 bg-green-950',
  checked_out: 'border-border text-muted-foreground bg-muted/20',
  cancelled: 'border-red-800 text-red-400 bg-red-950',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [roomSummary, setRoomSummary] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [roomsRes, bookingsRes, revenueRes, summaryRes] = await Promise.all([
          getRooms(),
          getBookings(),
          getRevenueSummary(),
          getRoomSummary(),
        ]);
        const rooms = roomsRes.data || [];
        const bookings = bookingsRes.data || [];
        const revenue = revenueRes.data || {};
        const today = new Date().toISOString().split('T')[0];

        setStats({
          totalRooms: rooms.length,
          available: rooms.filter((r) => r.status === 'available').length,
          occupied: rooms.filter((r) => r.status === 'occupied').length,
          activeBookings: bookings.filter(
            (b) => b.booking_status === 'confirmed' || b.booking_status === 'checked_in'
          ).length,
          todayCheckins: bookings.filter(
            (b) =>
              b.check_in?.split('T')[0] === today &&
              (b.booking_status === 'confirmed' || b.booking_status === 'checked_in')
          ).length,
          totalRevenue: revenue.paid_amount || 0,
          pendingRevenue: revenue.pending_amount || 0,
          totalBills: revenue.total_bills || 0,
        });
        setRecentBookings(bookings.slice(0, 8));
        setRoomSummary(summaryRes.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  const occupancyRate = useMemo(() => {
    if (!stats?.totalRooms) return 0;
    return ((stats.occupied / stats.totalRooms) * 100).toFixed(1);
  }, [stats]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      description: `${stats?.totalBills || 0} bills processed`,
      icon: IndianRupee,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      description: `${stats?.occupied || 0} of ${stats?.totalRooms || 0} occupied`,
      icon: BedDouble,
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Active Bookings',
      value: stats?.activeBookings || 0,
      description: `${stats?.todayCheckins || 0} check-ins today`,
      icon: CalendarCheck,
      trend: 'Live',
      trendUp: null,
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(stats?.pendingRevenue || 0),
      description: 'Awaiting collection',
      icon: TrendingDown,
      trend: '-2.1%',
      trendUp: false,
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Operational Control</p>
        <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.title} 
              className="animate-stagger-in border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur transition-all hover:border-border hover:shadow-lg"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className="flex items-center justify-center size-8 rounded-full bg-muted/30 border border-border/40">
                  <Icon className="size-3.5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">{card.description}</p>
                  {card.trendUp !== null && (
                    <div className={`flex items-center gap-1 text-[9px] font-bold ${
                      card.trendUp ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {card.trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      {card.trend}
                    </div>
                  )}
                  {card.trendUp === null && (
                    <Badge variant="outline" className="text-[9px] font-bold h-4 px-1.5 bg-indigo-950 text-indigo-400 border-indigo-800">
                      {card.trend}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50 bg-card/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-bold">Recent activity</CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-wider">Latest reservations and check-ins</CardDescription>
            </div>
            <Button variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-wider px-2">View All</Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-8 px-6">Guest</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-8">Room</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-8">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-8 text-right px-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.booking_id} className="border-border/40 hover:bg-muted/10 transition-colors group">
                    <TableCell className="px-6 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold">{booking.guest_name}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">{booking.room_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium tabular-nums">{booking.room_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest h-5 ${statusVariant[booking.booking_status]}`}>
                        {booking.booking_status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 text-xs font-bold tabular-nums">
                      {booking.total_amount ? formatCurrency(booking.total_amount) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/20 shadow-none">
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-sm font-bold">Room availability</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-wider">Live inventory breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            <ChartContainer
              config={{
                available: {
                  label: "Available",
                  color: "hsl(var(--chart-1))",
                },
                occupied: {
                  label: "Occupied",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[200px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={roomSummary.map(rs => ({
                    name: rs.type,
                    available: rs.available,
                    occupied: rs.total_rooms - rs.available,
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="occupied" stackId="a" fill="hsl(var(--foreground))" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="available" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <div className="space-y-4">
              {roomSummary.map((rs) => (
                <div key={rs.type} className="space-y-1.5 px-1">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                    <span className="text-foreground">{rs.type}</span>
                    <span className="text-muted-foreground tabular-nums">{rs.available} / {rs.total_rooms}</span>
                  </div>
                  <div className="h-1 w-full bg-muted/60 rounded-full overflow-hidden border border-border/20">
                    <div
                      className="h-full bg-foreground transition-all duration-700 ease-in-out"
                      style={{ width: `${(rs.available / rs.total_rooms) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="bg-border/30" />
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span>Overall Occupancy</span>
                <span className="text-foreground tabular-nums">{occupancyRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
