import { useState } from 'react';
import { login } from '@/api/auth';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import AntigravityBackground from '@/components/AntigravityBackground';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async (event) => {
    event.preventDefault();
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
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <AntigravityBackground />
      <Card className="relative z-10 w-80 border-border bg-card/90 backdrop-blur-sm shadow-none">
        <CardHeader className="space-y-1 pb-4 text-center">
          <h1 className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            Grand Stay
          </h1>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Portal
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Enter credentials to access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[10px] uppercase tracking-wider text-muted-foreground">Username</Label>
              <Input
                id="username"
                placeholder="admin"
                required
                className="h-8 text-xs bg-background/50 border-border/50 focus:border-foreground/50 transition-colors"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-8 text-xs bg-background/50 border-border/50 focus:border-foreground/50 transition-colors"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-8 text-xs font-semibold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <Separator className="bg-border/50" />

          <div className="space-y-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Demo Access</p>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <code className="bg-muted px-1 rounded">admin:admin123</code>
              <code className="bg-muted px-1 rounded">staff:staff123</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
