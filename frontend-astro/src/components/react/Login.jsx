import { useState } from 'react';
import { login } from '@/api/auth';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Hotel, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ username, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success(`Welcome back, ${res.data.username}!`);
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <Card className="w-full max-w-sm border-2 shadow-2xl bg-background/80 backdrop-blur-xl stagger-1 z-10 rounded-2xl">
        <CardHeader className="space-y-2 items-center pb-8 pt-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-2 shadow-xl shadow-primary/20 transition-transform hover:scale-105 duration-500">
            <Hotel size={28} className="text-primary-foreground" />
          </div>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight font-heading">Grand Stay</CardTitle>
            <CardDescription className="text-xs uppercase tracking-[0.2em] font-bold opacity-50 mt-1.5">Management Portal</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider opacity-70">Username</Label>
              <Input
                id="username"
                placeholder="admin"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="h-11 bg-muted/30 border-none rounded-xl px-4 focus-visible:ring-primary/30 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider opacity-70">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-11 bg-muted/30 border-none rounded-xl px-4 focus-visible:ring-primary/30 transition-all"
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-dashed border-primary/10 text-center">
            <p className="text-xs font-medium opacity-50 mb-3">ARE YOU A GUEST?</p>
            <a href="/customer/login">
              <Button variant="outline" className="w-full h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500/5 hover:text-sky-500 hover:border-sky-500/30 transition-all">
                Enter Guest Portal
              </Button>
            </a>
          </div>
        </CardContent>
          <div className="mt-8 text-center text-[10px] text-muted-foreground bg-muted/40 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
            <p className="font-bold mb-2 uppercase tracking-[0.15em] opacity-60">System Access</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <p className="font-bold text-foreground opacity-80 uppercase tracking-tighter">Admin</p>
                <p className="mt-0.5">admin / admin123</p>
              </div>
              <div className="text-left border-l pl-4 border-border/50">
                <p className="font-bold text-foreground opacity-80 uppercase tracking-tighter">Staff</p>
                <p className="mt-0.5">staff / staff123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Branding */}
      <footer className="absolute bottom-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-30">
        Professional Hotel Management System
      </footer>
    </div>
  );
}
