import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function CustomerLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/customer/login`, { identifier, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success(`Welcome, ${res.data.name}!`);
      window.location.href = '/customer/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <Card className="w-full max-w-sm border-2 shadow-2xl bg-background/80 backdrop-blur-xl stagger-1 z-10 rounded-2xl border-sky-500/20">
        <CardHeader className="space-y-2 items-center pb-8 pt-8">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center mb-2 shadow-xl shadow-sky/20 transition-transform hover:scale-105 duration-500">
            <User size={28} className="text-white" />
          </div>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight font-heading">Guest Portal</CardTitle>
            <CardDescription className="text-xs uppercase tracking-[0.2em] font-bold opacity-50 mt-1.5">Manage Your Stay</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-xs font-bold uppercase tracking-wider opacity-70">Email or Username</Label>
              <Input
                id="identifier"
                placeholder="guest@example.com"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-11 bg-muted/30 border-none rounded-xl px-4 focus-visible:ring-sky-500/30 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider opacity-70">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-muted/30 border-none rounded-xl px-4 focus-visible:ring-sky-500/30 transition-all"
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-sky-600/20 bg-sky-600 hover:bg-sky-700 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <footer className="absolute bottom-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-30">
        Grand Stay Guest Experience
      </footer>
    </div>
  );
}
