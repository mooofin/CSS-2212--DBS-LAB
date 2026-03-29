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
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ username, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success(`Welcome back, ${res.data.username}!`);
      
      // Small delay for toast to show before redirect
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Atmospheric Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background"></div>
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-[0_8px_32px_rgba(212,175,55,0.15)] bg-card/90 backdrop-blur-2xl stagger-1 z-10 rounded-3xl relative overflow-hidden">
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        
        <CardHeader className="space-y-4 items-center pb-10 pt-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center mb-3 shadow-2xl shadow-primary/40 transition-all hover:scale-110 hover:rotate-3 duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <Hotel size={36} className="text-primary-foreground relative z-10" />
          </div>
          <div className="text-center">
            <CardTitle className="text-5xl font-heading font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary mb-2">Grand Stay</CardTitle>
            <CardDescription className="text-xs uppercase tracking-[0.3em] font-bold text-primary/60 mt-3">Management Portal</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/70">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="h-12 bg-muted/40 border-2 border-primary/10 rounded-2xl px-5 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/30 transition-all font-medium text-base hover:border-primary/20"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/70">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-12 bg-muted/40 border-2 border-primary/10 rounded-2xl px-5 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/30 transition-all font-medium text-base hover:border-primary/20"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-13 rounded-2xl text-sm font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary mt-8" 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-dashed border-primary/10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/50 mb-4">Guest Access</p>
            <a href="/customer/login">
              <Button variant="outline" className="w-full h-12 rounded-2xl text-xs font-bold uppercase tracking-[0.15em] border-2 hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-400/40 transition-all duration-300">
                Enter Guest Portal →
              </Button>
            </a>
          </div>
        </CardContent>

        <div className="mt-4 text-center text-xs bg-gradient-to-br from-muted/60 to-muted/40 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 mx-10 mb-10">
          <p className="font-bold mb-4 uppercase tracking-[0.2em] text-primary/70">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-left">
              <p className="font-bold text-foreground uppercase tracking-tight text-sm mb-1">Admin</p>
              <p className="text-muted-foreground font-mono text-[11px]">admin / admin123</p>
            </div>
            <div className="text-left border-l-2 pl-6 border-primary/10">
              <p className="font-bold text-foreground uppercase tracking-tight text-sm mb-1">Staff</p>
              <p className="text-muted-foreground font-mono text-[11px]">staff / staff123</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Premium Footer Branding */}
      <footer className="absolute bottom-8 text-xs font-bold text-primary/30 uppercase tracking-[0.25em] flex items-center gap-3">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/30"></div>
        Professional Hotel Management
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/30"></div>
      </footer>
    </div>
  );
}
