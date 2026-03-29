import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, ShieldCheck, Loader2, Hotel, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { ModeToggle } from './ModeToggle';

export default function UnifiedLogin() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Staff/Admin State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Guest State
  const [guestIdentifier, setGuestIdentifier] = useState('');
  const [guestPassword, setGuestPassword] = useState('');

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success(`Welcome back, ${res.data.username}!`);
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/customer/login`, { 
        identifier: guestIdentifier, 
        password: guestPassword 
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success(`Welcome, ${res.data.name}!`);
      window.location.href = '/customer/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.error || 'Guest authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      {/* Theme Toggle in Corner */}
      <div className="absolute top-8 right-8 z-50">
        <ModeToggle />
      </div>

      <div className="w-full max-w-[450px] relative z-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
        <div className="flex flex-col items-center mb-8 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0 duration-500">
            <Hotel size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground/90 font-heading">GRAND STAY</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground opacity-60 mt-1">Luxury Reimagined</p>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-background/60 backdrop-blur-3xl rounded-[2.5rem] border-primary/10 overflow-hidden">
          <Tabs defaultValue="staff" className="w-full">
            <div className="px-8 pt-8">
              <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/30 p-1.5 rounded-2xl">
                <TabsTrigger value="staff" className="rounded-xl font-bold text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300">
                  <ShieldCheck size={14} /> Team
                </TabsTrigger>
                <TabsTrigger value="guest" className="rounded-xl font-bold text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300">
                  <User size={14} /> Guests
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-10 pt-8">
              <TabsContent value="staff" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-2 text-center mb-6">
                  <CardTitle className="text-2xl font-bold">Internal Portal</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold opacity-50">Management & Operations</CardDescription>
                </div>
                
                <form onSubmit={handleStaffLogin} className="space-y-5">
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1">Username</Label>
                    <Input
                      placeholder="e.g. admin"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-14 bg-muted/40 border-none rounded-2xl px-5 focus-visible:ring-primary/20 transition-all font-medium text-base shadow-inner"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1">Secret Key</Label>
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 bg-muted/40 border-none rounded-2xl px-5 focus-visible:ring-primary/20 transition-all text-base shadow-inner"
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all group mt-4" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                    Access Dashboard <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="guest" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2 text-center mb-6">
                  <CardTitle className="text-2xl font-bold">Guest Portal</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold opacity-50">Manage Your Stay</CardDescription>
                </div>

                <form onSubmit={handleGuestLogin} className="space-y-5">
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1">Email or Username</Label>
                    <Input
                      placeholder="guest@example.com"
                      required
                      value={guestIdentifier}
                      onChange={(e) => setGuestIdentifier(e.target.value)}
                      className="h-14 bg-muted/40 border-none rounded-2xl px-5 focus-visible:ring-primary/20 transition-all font-medium text-base shadow-inner"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1">Password</Label>
                    <Input
                      type="password"
                      required
                      value={guestPassword}
                      onChange={(e) => setGuestPassword(e.target.value)}
                      className="h-14 bg-muted/40 border-none rounded-2xl px-5 focus-visible:ring-primary/20 transition-all text-base shadow-inner"
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all group mt-4" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                    Enter Portal <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <footer className="mt-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30">
            Secure Access Portal • Grand Stay v2.0
          </p>
        </footer>
      </div>
    </div>
  );
}
