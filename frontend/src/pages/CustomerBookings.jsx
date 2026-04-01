import { useState, useEffect } from 'react';
import { getAvailability, createBooking } from '@/api/bookings';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BedDouble, 
  Calendar, 
  Users,
  LogOut,
  Hotel,
  ArrowLeft,
  Loader2,
  IndianRupee,
  Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AntigravityBackground from '@/components/AntigravityBackground';

export default function CustomerBookings() {
  const [user, setUser] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!storedUser || storedUser.role !== 'customer') {
      navigate('/customer/login');
      return;
    }
    setUser(storedUser);
    // Set default dates (today + 1 week)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    setCheckIn(today.toISOString().split('T')[0]);
    setCheckOut(nextWeek.toISOString().split('T')[0]);
  }, [navigate]);

  const searchRooms = async () => {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (checkIn >= checkOut) {
      toast.error('Check-out must be after check-in');
      return;
    }
    
    setSearching(true);
    try {
      const res = await getAvailability({ check_in: checkIn, check_out: checkOut });
      setAvailableRooms(res.data);
      if (res.data.length === 0) {
        toast.info('No rooms available for selected dates');
      }
    } catch (err) {
      toast.error('Failed to search rooms');
    } finally {
      setSearching(false);
    }
  };

  const bookRoom = async (room) => {
    if (!user?.guest_id) {
      toast.error('Please login again');
      return;
    }
    
    setBookingRoom(room.room_id);
    try {
      const bookingData = {
        guest_id: user.guest_id,
        room_id: room.room_id,
        check_in: checkIn,
        check_out: checkOut,
        adults: adults,
        children: children,
        special_requests: ''
      };
      
      await createBooking(bookingData);
      toast.success(`Room ${room.room_number} booked successfully!`);
      // Refresh available rooms
      searchRooms();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBookingRoom(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/customer/login');
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  if (!user) return null;

  const nights = calculateNights();

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
            <Link to="/customer/dashboard">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                <ArrowLeft className="h-3 w-3" />
                Back
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 text-xs gap-1">
              <LogOut className="h-3 w-3" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">Book a Room</h2>
          <p className="text-xs text-muted-foreground">Search availability and make a reservation</p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Check-in</label>
                <Input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Check-out</label>
                <Input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Adults</label>
                <Input
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Children</label>
                <Input
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={searchRooms} 
                  disabled={searching}
                  className="h-8 text-xs w-full"
                >
                  {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3 mr-1" />}
                  Search
                </Button>
              </div>
            </div>
            {nights > 0 && (
              <p className="text-[10px] text-muted-foreground mt-2">
                {nights} night{nights > 1 ? 's' : ''} selected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {availableRooms.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Available Rooms ({availableRooms.length})</h3>
            {availableRooms.map((room) => (
              <Card key={room.room_id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BedDouble className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Room {room.room_number}</p>
                          <Badge variant="outline" className="text-[9px] h-4">{room.type}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Floor {room.floor} • Max {room.max_occupancy} guests
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-1">{room.amenities}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <IndianRupee className="h-3 w-3" />
                        {parseFloat(room.price_per_night).toLocaleString()}
                        <span className="text-[10px] font-normal text-muted-foreground">/night</span>
                      </div>
                      {nights > 0 && (
                        <p className="text-[9px] text-muted-foreground">
                          Total: ₹{(room.price_per_night * nights).toLocaleString()} for {nights} nights
                        </p>
                      )}
                      <Button 
                        size="sm" 
                        className="h-7 text-xs mt-2"
                        onClick={() => bookRoom(room)}
                        disabled={bookingRoom === room.room_id}
                      >
                        {bookingRoom === room.room_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Book Now'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {availableRooms.length === 0 && !searching && (
          <Card>
            <CardContent className="p-8 text-center">
              <BedDouble className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No rooms to display</p>
              <p className="text-[10px] text-muted-foreground mt-1">Select dates and click Search</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
