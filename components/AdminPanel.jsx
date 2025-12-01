'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Home, Users, CreditCard, Mail, Target, Lightbulb, Settings, LogOut, Plus, Trash2, Check, X, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [content, setContent] = useState({});
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [initiatives, setInitiatives] = useState([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchAllData();
  }, [isLoggedIn]);

  const verifyToken = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${authToken}` } });
      if (res.ok) {
        setUser(await res.json());
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('adminToken', data.token);
        toast.success('Login successful!');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken('');
    setUser(null);
    localStorage.removeItem('adminToken');
    toast.success('Logged out');
  };

  const fetchWithAuth = (url, options = {}) => {
    return fetch(url, { ...options, headers: { ...options.headers, 'Authorization': `Bearer ${token}` } });
  };

  const fetchAllData = async () => {
    try {
      const [contentRes, membersRes, paymentsRes, goalsRes, initiativesRes] = await Promise.all([
        fetch('/api/content'),
        fetchWithAuth('/api/members'),
        fetchWithAuth('/api/payments'),
        fetch('/api/goals'),
        fetch('/api/initiatives')
      ]);
      setContent(await contentRes.json());
      setMembers(await membersRes.json());
      setPayments(await paymentsRes.json());
      setGoals(await goalsRes.json());
      setInitiatives(await initiativesRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateContent = async (key, value) => {
    try {
      await fetchWithAuth(`/api/content/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, type: 'text' }),
      });
      toast.success('Content updated');
      fetchAllData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const updateMember = async (id, status) => {
    try {
      await fetchWithAuth(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success(`Member ${status}`);
      fetchAllData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const addGoal = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await fetchWithAuth('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: fd.get('title'), description: fd.get('description'), icon: 'target', order: goals.length + 1 }),
      });
      toast.success('Goal added');
      fetchAllData();
      e.target.reset();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const deleteGoal = async (id) => {
    if (!confirm('Delete?')) return;
    try {
      await fetchWithAuth(`/api/goals/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center islamic-pattern">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-deep-blue">Admin Login</CardTitle>
            <CardDescription>The Servants NGO</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue="theservants@admin.com" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" defaultValue="servants786110" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">Login</Button>
              <a href="/" className="text-sm text-center text-blue-600 hover:underline">Back to Website</a>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-deep-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gold">Admin Panel</h1>
              <p className="text-sm text-white/80">The Servants NGO</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.email}</p>
                <p className="text-xs text-white/60">{user?.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-gold text-gold hover:bg-gold hover:text-deep-blue">
                <LogOut className="h-4 w-4 mr-2" />Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 bg-white p-2 rounded-lg shadow">
            <TabsTrigger value="dashboard"><Home className="h-4 w-4 mr-2" />Dashboard</TabsTrigger>
            <TabsTrigger value="content"><Settings className="h-4 w-4 mr-2" />Content</TabsTrigger>
            <TabsTrigger value="members"><Users className="h-4 w-4 mr-2" />Members</TabsTrigger>
            <TabsTrigger value="payments"><CreditCard className="h-4 w-4 mr-2" />Payments</TabsTrigger>
            <TabsTrigger value="goals"><Target className="h-4 w-4 mr-2" />Goals</TabsTrigger>
            <TabsTrigger value="initiatives"><Lightbulb className="h-4 w-4 mr-2" />Initiatives</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid md:grid-cols-4 gap-6">
              <Card><CardHeader><CardTitle className="text-sm">Total Members</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-deep-blue">{members.length}</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-gold">{members.filter(m => m.status === 'pending').length}</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">Payments</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-600">₹{payments.reduce((s, p) => s + (p.amount || 0), 0)}</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">Goals</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-blue-600">{goals.length}</p></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Hero Title</Label><Input defaultValue={content.hero_title} onBlur={(e) => updateContent('hero_title', e.target.value)} /></div>
                <div><Label>Hero Subtitle</Label><Textarea defaultValue={content.hero_subtitle} onBlur={(e) => updateContent('hero_subtitle', e.target.value)} /></div>
                <div><Label>About Us</Label><Textarea rows={6} defaultValue={content.about_us} onBlur={(e) => updateContent('about_us', e.target.value)} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader><CardTitle>Members ({members.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Tier</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.name}</TableCell>
                        <TableCell>{m.email}</TableCell>
                        <TableCell><span className="px-2 py-1 bg-gold/10 text-gold rounded text-xs">{m.membershipTier}</span></TableCell>
                        <TableCell><span className={`px-2 py-1 rounded text-xs ${m.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.status}</span></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {m.status === 'pending' && <><Button size="sm" variant="outline" onClick={() => updateMember(m.id, 'approved')}><Check className="h-4 w-4" /></Button><Button size="sm" variant="outline" onClick={() => updateMember(m.id, 'rejected')}><X className="h-4 w-4" /></Button></>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle>Transactions ({payments.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{p.type}</span></TableCell>
                        <TableCell className="font-bold">₹{p.amount}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded text-xs ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></TableCell>
                        <TableCell className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader><CardTitle>Add Goal</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={addGoal} className="space-y-4">
                  <div><Label>Title</Label><Input name="title" required /></div>
                  <div><Label>Description</Label><Textarea name="description" required /></div>
                  <Button type="submit"><Plus className="h-4 w-4 mr-2" />Add Goal</Button>
                </form>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader><CardTitle>Goals ({goals.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((g) => (
                    <div key={g.id} className="flex justify-between p-4 border rounded">
                      <div><h4 className="font-semibold text-deep-blue">{g.title}</h4><p className="text-sm text-gray-600">{g.description}</p></div>
                      <Button size="sm" variant="destructive" onClick={() => deleteGoal(g.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="initiatives">
            <Card>
              <CardHeader><CardTitle>Initiatives ({initiatives.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {initiatives.map((i) => (
                    <div key={i.id} className="p-4 border rounded">
                      <h4 className="font-semibold text-deep-blue">{i.title}</h4>
                      <p className="text-sm text-gray-600">{i.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(i.date).toLocaleDateString()} • {i.location}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
