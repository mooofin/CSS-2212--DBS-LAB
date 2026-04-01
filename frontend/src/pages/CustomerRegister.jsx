import { useState } from 'react';
import { customerRegister } from '@/api/auth';
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
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import AntigravityBackground from '@/components/AntigravityBackground';

export default function CustomerRegister() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await customerRegister(formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Registration successful! Welcome!');
      window.location.href = '/customer/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <AntigravityBackground />
      <Card className="relative z-10 w-96 border-border bg-card/90 backdrop-blur-sm shadow-none">
        <CardHeader className="space-y-1 pb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h1 className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
              Guest Portal
            </h1>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Create Account
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Register to book rooms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="first_name" className="text-[10px] uppercase tracking-wider text-muted-foreground">First Name *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  required
                  className="h-8 text-xs"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="last_name" className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Name *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  required
                  className="h-8 text-xs"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-wider text-muted-foreground">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="h-8 text-xs"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="username" className="text-[10px] uppercase tracking-wider text-muted-foreground">Username (optional)</Label>
              <Input
                id="username"
                name="username"
                className="h-8 text-xs"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-wider text-muted-foreground">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="h-8 text-xs"
                value={formData.password}
                onChange={handleChange}
              />
              <p className="text-[9px] text-muted-foreground">Minimum 6 characters</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-[10px] uppercase tracking-wider text-muted-foreground">Phone</Label>
              <Input
                id="phone"
                name="phone"
                className="h-8 text-xs"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="text-[10px] uppercase tracking-wider text-muted-foreground">Address</Label>
              <Input
                id="address"
                name="address"
                className="h-8 text-xs"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-8 text-xs font-semibold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <Separator className="bg-border/50" />

          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">
              Already have an account?{' '}
              <Link to="/customer/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
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
