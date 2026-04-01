import { useState } from 'react';
import { customerLogin } from '@/api/auth';
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
import { ArrowLeft, Loader2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import AntigravityBackground from '@/components/AntigravityBackground';

export default function CustomerLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await customerLogin({ identifier, password });
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
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <AntigravityBackground />
      <Card className="relative z-10 w-80 border-border bg-card/90 backdrop-blur-sm shadow-none">
        <CardHeader className="space-y-1 pb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <User className="h-4 w-4 text-primary" />
            <h1 className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
              Guest Portal
            </h1>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Sign In
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Access your bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-[10px] uppercase tracking-wider text-muted-foreground">Email or Username</Label>
              <Input
                id="identifier"
                placeholder="your@email.com"
                required
                className="h-8 text-xs bg-background/50 border-border/50 focus:border-foreground/50 transition-colors"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="email"
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
              className="w-full h-8 text-xs font-semibold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <Separator className="bg-border/50" />

          <div className="space-y-2">
            <p className="text-[10px] text-center text-muted-foreground">
              Don't have an account?
            </p>
            <Link to="/customer/register">
              <Button
                variant="outline"
                className="w-full h-8 text-xs font-medium"
              >
                Create Account
              </Button>
            </Link>
          </div>

          <Separator className="bg-border/50" />

          <Link to="/login" className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Back to Staff Portal
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
