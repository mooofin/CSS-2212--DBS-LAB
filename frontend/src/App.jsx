import { useState, useEffect } from 'react';
import {
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ToastProvider, useToast } from './components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Guests from './pages/Guests';
import Bookings from './pages/Bookings';
import Billing from './pages/Billing';
import Staff from './pages/Staff';
import Login from './pages/Login';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerBookings from './pages/CustomerBookings';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  CalendarRange,
  IndianRupee,
  UserCog,
  Search,
  Settings,
  LogOut,
  ChevronUp,
  User,
} from 'lucide-react';

const NAV_MAIN = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/guests', label: 'Guests', icon: Users },
  { to: '/bookings', label: 'Bookings', icon: CalendarRange },
];

const NAV_ADMIN = [
  { to: '/billing', label: 'Billing', icon: IndianRupee },
  { to: '/staff', label: 'Staff', icon: UserCog },
];

function Layout() {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'customer') {
    return <Navigate to="/customer/dashboard" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background font-mono selection:bg-foreground/10 selection:text-foreground">
        <Sidebar collapsible="none" className="border-r border-border bg-card">
          <SidebarHeader className="p-4 pt-6">
            <div className="flex flex-col gap-0.5 px-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Grand Stay</p>
              <h2 className="text-sm font-bold tracking-tight">Management</h2>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest px-2 pb-2">Main</SidebarGroupLabel>
              <SidebarMenu>
                {NAV_MAIN.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.to}
                      tooltip={item.label}
                      className="h-8 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <NavLink to={item.to}>
                        <item.icon className="size-3.5" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            {user.role === 'admin' && (
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-[10px] uppercase tracking-widest px-2 pb-2">Admin</SidebarGroupLabel>
                <SidebarMenu>
                  {NAV_ADMIN.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.to}
                        tooltip={item.label}
                        className="h-8 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <NavLink to={item.to}>
                          <item.icon className="size-3.5" />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-10 w-full justify-start gap-3 px-2">
                  <Avatar className="size-6 border border-border">
                    <AvatarFallback className="text-[10px] bg-muted">
                      {user.username?.[0]?.toUpperCase() ?? 'G'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start gap-0 min-w-0">
                    <p className="truncate text-xs font-semibold">{user.username}</p>
                    <p className="truncate text-[9px] text-muted-foreground uppercase tracking-wider">{user.role}</p>
                  </div>
                  <ChevronUp className="ml-auto size-3 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-52 bg-card border-border shadow-2xl">
                <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => navigate('/settings')}>
                  <Settings className="size-3.5" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <Separator className="my-1 bg-border/50" />
                <DropdownMenuItem className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="size-3.5" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col overflow-hidden bg-background">
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="size-3.5 text-muted-foreground" />
                <Input
                  className="h-7 w-64 border-none bg-transparent text-xs focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
                <Settings className="size-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 scrollbar-hide">
            <div className="animate-stagger-in">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
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
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        
        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/book" element={<CustomerBookings />} />
        
        {/* Staff/Admin Routes */}
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="guests" element={<Guests />} />
          <Route path="bookings" element={<Bookings />} />
          <Route
            path="billing"
            element={
              <RoleGuard adminOnly>
                <Billing />
              </RoleGuard>
            }
          />
          <Route
            path="staff"
            element={
              <RoleGuard adminOnly>
                <Staff />
              </RoleGuard>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
