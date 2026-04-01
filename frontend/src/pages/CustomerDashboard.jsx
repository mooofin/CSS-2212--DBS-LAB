import { useState, useEffect } from 'react';
import { getCustomerBookings } from '@/api/auth';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BedDouble, 
  Calendar, 
  LogOut, 
  User,
  Hotel,
  ArrowRight,
  Loader2,
  Receipt
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AntigravityBackground from '@/components/AntigravityBackground';

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!storedUser || storedUser.role !== 'customer') {
      navigate('/customer/login');
      return;
    }
    setUser(storedUser);
    fetchBookings(storedUser.guest_id);
  }, [navigate]);

  const fetchBookings = async (guestId) => {
    try {
      const res = await getCustomerBookings(guestId);
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/customer/login');
  };

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'secondary',
      checked_in: 'default',
      checked_out: 'outline',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status?.replace('_', ' ')}</Badge>;
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen">
      <AntigravityBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Hotel className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Grand Stay</h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Guest Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium">{user.name}</p>
              <p className="text-[9px] text-muted-foreground">{user.username}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 text-xs gap-1">
              <LogOut className="h-3 w-3" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-1">Welcome back, {user.name?.split(' ')[0]}</h2>
          <p className="text-xs text-muted-foreground">Manage your bookings and reservations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{bookings.length}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">
                  {bookings.filter(b => ['confirmed', 'checked_in'].includes(b.booking_status)).length}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">
                  ₹{bookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0).toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">My Bookings</CardTitle>
                <CardDescription className="text-[10px]">Your reservation history</CardDescription>
              </div>
              <Link to="/customer/book">
                <Button size="sm" className="h-7 text-xs">
                  Book a Room
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <BedDouble className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No bookings yet</p>
                <Link to="/customer/book">
                  <Button variant="outline" size="sm" className="mt-3 h-7 text-xs">
                    Make your first booking
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div 
                    key={booking.booking_id} 
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BedDouble className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">Room {booking.room_number} — {booking.room_type}</p>
                        <p className="text-[9px] text-muted-foreground">
                          {new Date(booking.check_in).toLocaleDateString()} → {new Date(booking.check_out).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(booking.booking_status)}
                      <p className="text-[9px] text-muted-foreground mt-1">
                        {booking.total_amount ? `₹${parseFloat(booking.total_amount).toLocaleString()}` : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link to="/customer/profile">
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <User className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-medium">My Profile</p>
                  <p className="text-[9px] text-muted-foreground">Update your details</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/customer/book">
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <BedDouble className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-medium">Browse Rooms</p>
                  <p className="text-[9px] text-muted-foreground">View availability</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
