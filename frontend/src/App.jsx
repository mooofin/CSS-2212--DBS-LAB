import { NavLink, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider, useToast } from './components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Guests from './pages/Guests';
import Bookings from './pages/Bookings';
import Billing from './pages/Billing';
import Staff from './pages/Staff';
import Login from './pages/Login';
import {
  LayoutDashboard, BedDouble, Users, CalendarRange,
  IndianRupee, UserCog, Hotel, Search, Settings, HelpCircle, LogOut
} from 'lucide-react';

const NAV_MAIN = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/rooms',     label: 'Rooms',     icon: BedDouble },
  { to: '/guests',    label: 'Guests',    icon: Users },
  { to: '/bookings',  label: 'Bookings',  icon: CalendarRange },
  { to: '/billing',   label: 'Billing',   icon: IndianRupee, adminOnly: true },
  { to: '/staff',     label: 'Staff',     icon: UserCog,     adminOnly: true },
];

function Layout({ children }) {
  const navigate = useNavigate();
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const visibleNav = NAV_MAIN.filter(item => !item.adminOnly || user.role === 'admin');

  return (
    <div className="flex h-screen bg-muted/40 font-sans selection:bg-primary/30">
      <aside className="w-64 flex flex-col gap-0 bg-background/60 backdrop-blur-xl m-2 mr-0 rounded-xl border shrink-0 overflow-hidden stagger-1">
        <div className="px-4 py-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Hotel size={16} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none font-heading tracking-tight">Grand Stay</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium opacity-70">Management</p>
          </div>
        </div>

        <Separator />

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-2 pb-1.5 pt-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Platform</p>
          {visibleNav.map(item => (
            <NavLink key={item.to} to={item.to}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`w-full justify-start gap-2 text-[13px] ${isActive ? 'font-medium' : 'text-muted-foreground font-normal'}`}
                >
                  <item.icon size={15} />
                  {item.label}
                </Button>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-2 space-y-0.5">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-[13px] text-muted-foreground font-normal">
            <Settings size={15} /> Settings
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-[13px] text-muted-foreground font-normal">
            <HelpCircle size={15} /> Help
          </Button>
        </div>

        <Separator />

        <div className="px-4 py-3 flex items-center gap-3 bg-muted/20">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
            {user.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium leading-none truncate capitalize">{user.username}</p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5 uppercase tracking-tighter">{user.role}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleLogout}>
            <LogOut size={14} />
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto m-2 rounded-xl border bg-background relative">
        <header className="flex items-center gap-2 border-b px-4 h-12 shrink-0 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2 flex-1">
            <Search size={14} className="text-muted-foreground" />
            <input 
              className="bg-transparent border-none outline-none text-sm text-muted-foreground w-full placeholder:text-muted-foreground/50" 
              placeholder="Search anything..." 
            />
          </div>
        </header>

        <div className="h-[calc(100%-48px)]">
           {children}
        </div>
      </main>
    </div>
  );
}

function RoleGuard({ children, adminOnly = false }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/rooms" element={<Layout><Rooms /></Layout>} />
        <Route path="/guests" element={<Layout><Guests /></Layout>} />
        <Route path="/bookings" element={<Layout><Bookings /></Layout>} />
        <Route 
          path="/billing" 
          element={<Layout><RoleGuard adminOnly><Billing /></RoleGuard></Layout>} 
        />
        <Route 
          path="/staff" 
          element={<Layout><RoleGuard adminOnly><Staff /></RoleGuard></Layout>} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
