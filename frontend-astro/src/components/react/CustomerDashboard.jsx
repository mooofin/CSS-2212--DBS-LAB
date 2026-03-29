import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, MapPin, User as UserIcon } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'customer') {
      window.location.href = '/customer/login';
      return;
    }
    setUser(storedUser);
    fetchData(storedUser.guest_id);
  }, []);

  const fetchData = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customer/bookings/${id}`);
      setBookings(res.data);
    } catch (err) {
      // Silent fail - will show empty bookings list
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center opacity-50">Synchronizing your stay...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight font-heading">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground font-medium">Here's a summary of your journeys with us.</p>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('user'); window.location.href = '/customer/login'; }}
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all opacity-50 hover:opacity-100"
        >
          Sign Out
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-sky-600 text-white border-none shadow-xl shadow-sky-600/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sky-100 text-xs font-bold uppercase tracking-wider">Total Stays</p>
                <p className="text-3xl font-bold mt-1">{bookings.length}</p>
              </div>
              <Calendar className="opacity-20" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading">Your Bookings</h2>
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.booking_id} className="overflow-hidden border-none bg-muted/30 backdrop-blur-sm hover:bg-muted/40 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm">
                        <MapPin size={18} className="text-sky-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase opacity-50 tracking-wider">Room {booking.room_number}</p>
                        <p className="font-bold">{booking.room_type} Suite</p>
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Check In</p>
                        <p className="font-medium text-sm">{new Date(booking.check_in).toLocaleDateString()}</p>
                      </div>
                      <div className="border-l pl-8">
                        <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Check Out</p>
                        <p className="font-medium text-sm">{new Date(booking.check_out).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col justify-between items-end gap-2">
                    <Badge className={
                      booking.booking_status === 'confirmed' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' : 
                      booking.booking_status === 'checked_in' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20'
                    }>
                      {booking.booking_status.toUpperCase()}
                    </Badge>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase opacity-40">Total Charged</p>
                      <p className="text-lg font-bold">{booking.total_amount != null ? `₹${booking.total_amount}` : '—'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {bookings.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed rounded-2xl opacity-30">
              <p className="font-bold">No bookings found yet. Ready for your next adventure?</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
