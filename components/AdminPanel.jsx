'use client';

/**
 * ============================================
 * ADMIN PANEL - THE SERVANTS NGO
 * ============================================
 * Complete admin dashboard with:
 * - Login/Authentication
 * - Content Management
 * - Member Management
 * - Payment Dashboard
 * - Email Management
 * - Gallery Management
 * - Initiative/Goals Management
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Home,
  Users, 
  CreditCard, 
  Mail, 
  Image, 
  Target, 
  Lightbulb,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Check,
  X,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // State for various data
  const [content, setContent] = useState({});
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);

  useEffect(() => {
    // Check if already logged in
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();
    }
  }, [isLoggedIn]);

  const verifyToken = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
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
    const email = formData.get('email');
    const password = formData.get('password');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken('');
    setUser(null);
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchContent(),
      fetchMembers(),
      fetchPayments(),
      fetchGoals(),
      fetchInitiatives(),
      fetchGallery(),
      fetchEmailLogs(),
    ]);
  };

  const fetchWithAuth = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  };

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetchWithAuth('/api/members');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetchWithAuth('/api/payments');
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchInitiatives = async () => {
    try {
      const res = await fetch('/api/initiatives');
      const data = await res.json();
      setInitiatives(data);
    } catch (error) {
      console.error('Error fetching initiatives:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setGallery(data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const res = await fetchWithAuth('/api/email/logs');
      const data = await res.json();
      setEmailLogs(data);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  // Content Management
  const updateContent = async (key, value) => {
    try {
      const res = await fetchWithAuth(`/api/content/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, type: 'text' }),
      });

      if (res.ok) {
        toast.success('Content updated successfully');
        fetchContent();
      }
    } catch (error) {
      toast.error('Failed to update content');
    }
  };

  // Member Management
  const updateMemberStatus = async (memberId, status) => {
    try {
      const res = await fetchWithAuth(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvedAt: new Date() }),
      });

      if (res.ok) {
        toast.success(`Member ${status}`);
        fetchMembers();
      }
    } catch (error) {
      toast.error('Failed to update member');
    }
  };

  const deleteMember = async (memberId) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const res = await fetchWithAuth(`/api/members/${memberId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Member deleted');
        fetchMembers();
      }
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  // Goal Management
  const addGoal = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const res = await fetchWithAuth('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          icon: 'target',
          order: goals.length + 1,
        }),
      });

      if (res.ok) {
        toast.success('Goal added');
        fetchGoals();
        e.target.reset();
      }
    } catch (error) {
      toast.error('Failed to add goal');
    }
  };

  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure?')) return;

    try {
      const res = await fetchWithAuth(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Goal deleted');
        fetchGoals();
      }
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  // Initiative Management
  const addInitiative = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const res = await fetchWithAuth('/api/initiatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          date: formData.get('date'),
          location: formData.get('location'),
          imageUrl: 'https://via.placeholder.com/400x300/001F3F/D4AF37?text=Initiative',
        }),
      });

      if (res.ok) {
        toast.success('Initiative added');
        fetchInitiatives();
        e.target.reset();
      }
    } catch (error) {
      toast.error('Failed to add initiative');
    }
  };

  const deleteInitiative = async (initiativeId) => {
    if (!confirm('Are you sure?')) return;

    try {
      const res = await fetchWithAuth(`/api/initiatives/${initiativeId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Initiative deleted');
        fetchInitiatives();
      }
    } catch (error) {
      toast.error('Failed to delete initiative');
    }
  };

  // Email Management
  const sendNewsletter = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await fetchWithAuth('/api/email/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formData.get('subject'),
          content: formData.get('content'),
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success(`Newsletter sent to ${result.sent || 'all'} members`);
        } else {
          toast.warning(result.message || 'Email service not configured');
        }
        e.target.reset();
        fetchEmailLogs();
      }
    } catch (error) {
      toast.error('Failed to send newsletter');
    }
  };

  // Export members to CSV
  const exportMembers = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Tier', 'Status', 'Joined'].join(','),
      ...members.map(m => [
        m.name,
        m.email,
        m.phone,
        m.membershipTier,
        m.status,
        new Date(m.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members-${new Date().toISOString()}.csv`;
    a.click();
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className=\"min-h-screen flex items-center justify-center islamic-pattern\">\n        <Card className=\"w-full max-w-md\">\n          <CardHeader className=\"text-center\">\n            <CardTitle className=\"text-3xl text-deep-blue\">Admin Login</CardTitle>\n            <CardDescription>The Servants NGO</CardDescription>\n          </CardHeader>\n          <form onSubmit={handleLogin}>\n            <CardContent className=\"space-y-4\">\n              <div>\n                <Label htmlFor=\"email\">Email</Label>\n                <Input \n                  id=\"email\" \n                  name=\"email\" \n                  type=\"email\" \n                  defaultValue=\"theservants@admin.com\"\n                  required \n                />\n              </div>\n              <div>\n                <Label htmlFor=\"password\">Password</Label>\n                <Input \n                  id=\"password\" \n                  name=\"password\" \n                  type=\"password\" \n                  defaultValue=\"servants786110\"\n                  required \n                />\n              </div>\n            </CardContent>\n            <CardFooter className=\"flex flex-col gap-4\">\n              <Button type=\"submit\" className=\"w-full\" disabled={loading}>\n                {loading ? 'Logging in...' : 'Login'}\n              </Button>\n              <a href=\"/\" className=\"text-sm text-center text-blue-600 hover:underline\">\n                Back to Website\n              </a>\n            </CardFooter>\n          </form>\n        </Card>\n      </div>\n    );\n  }\n\n  // Admin Dashboard\n  return (\n    <div className=\"min-h-screen bg-gray-50\">\n      {/* Header */}\n      <header className=\"bg-deep-blue text-white shadow-lg\">\n        <div className=\"container mx-auto px-4 py-4\">\n          <div className=\"flex items-center justify-between\">\n            <div>\n              <h1 className=\"text-2xl font-bold text-gold\">Admin Panel</h1>\n              <p className=\"text-sm text-white/80\">The Servants NGO</p>\n            </div>\n            <div className=\"flex items-center gap-4\">\n              <div className=\"text-right hidden sm:block\">\n                <p className=\"text-sm font-semibold\">{user?.email}</p>\n                <p className=\"text-xs text-white/60\">{user?.role}</p>\n              </div>\n              <Button \n                variant=\"outline\" \n                size=\"sm\"\n                onClick={handleLogout}\n                className=\"border-gold text-gold hover:bg-gold hover:text-deep-blue\"\n              >\n                <LogOut className=\"h-4 w-4 mr-2\" />\n                Logout\n              </Button>\n            </div>\n          </div>\n        </div>\n      </header>\n\n      <div className=\"container mx-auto px-4 py-8\">\n        <Tabs value={activeTab} onValueChange={setActiveTab} className=\"space-y-6\">\n          <TabsList className=\"grid grid-cols-3 lg:grid-cols-7 gap-2 bg-white p-2 rounded-lg shadow\">\n            <TabsTrigger value=\"dashboard\" className=\"flex items-center gap-2\">\n              <Home className=\"h-4 w-4\" />\n              <span className=\"hidden sm:inline\">Dashboard</span>\n            </TabsTrigger>\n            <TabsTrigger value=\"content\" className=\"flex items-center gap-2\">\n              <Settings className=\"h-4 w-4\" />\n              <span className=\"hidden sm:inline\">Content</span>\n            </TabsTrigger>\n            <TabsTrigger value=\"members\" className=\"flex items-center gap-2\">\n              <Users className=\"h-4 w-4\" />\n              <span className=\"hidden sm:inline\">Members</span>\n            </TabsTrigger>\n            <TabsTrigger value=\"payments\" className=\"flex items-center gap-2\">\n              <CreditCard className=\"h-4 w-4\" />\n              <span className=\"hidden sm:inline\">Payments</span>\n            </TabsTrigger>\n            <TabsTrigger value=\"goals\" className=\"flex items-center gap-2\">\n              <Target className=\"h-4 w-4\" />\n              <span className=\"hidden sm:inline\">Goals</span>\n            </TabsTrigger>\n            <TabsTrigger value=\"initiatives\" className=\"flex items-center gap-2\">\n              <Lightbulb className=\"h-4 w-4\" />\n              <span className=\"hidden sm:inline\">Initiatives</span>\n            </TabsTrigger>\n            <TabsTrigger value=\"email\" className=\"flex items-center gap-2\">\n              <Mail className=\"h-4 w-4\" />\n              <span className=\"hidden sm:inline\">Email</span>\n            </TabsTrigger>\n          </TabsList>\n\n          {/* Dashboard Tab */}\n          <TabsContent value=\"dashboard\" className=\"space-y-6\">\n            <div className=\"grid md:grid-cols-4 gap-6\">\n              <Card>\n                <CardHeader>\n                  <CardTitle className=\"text-sm\">Total Members</CardTitle>\n                </CardHeader>\n                <CardContent>\n                  <p className=\"text-3xl font-bold text-deep-blue\">{members.length}</p>\n                </CardContent>\n              </Card>\n              <Card>\n                <CardHeader>\n                  <CardTitle className=\"text-sm\">Pending Approvals</CardTitle>\n                </CardHeader>\n                <CardContent>\n                  <p className=\"text-3xl font-bold text-gold\">\n                    {members.filter(m => m.status === 'pending').length}\n                  </p>\n                </CardContent>\n              </Card>\n              <Card>\n                <CardHeader>\n                  <CardTitle className=\"text-sm\">Total Payments</CardTitle>\n                </CardHeader>\n                <CardContent>\n                  <p className=\"text-3xl font-bold text-green-600\">\n                    ₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0)}\n                  </p>\n                </CardContent>\n              </Card>\n              <Card>\n                <CardHeader>\n                  <CardTitle className=\"text-sm\">Email Logs</CardTitle>\n                </CardHeader>\n                <CardContent>\n                  <p className=\"text-3xl font-bold text-blue-600\">{emailLogs.length}</p>\n                </CardContent>\n              </Card>\n            </div>\n\n            <Card>\n              <CardHeader>\n                <CardTitle>Recent Activity</CardTitle>\n              </CardHeader>\n              <CardContent>\n                <p className=\"text-gray-500\">All systems operational</p>\n              </CardContent>\n            </Card>\n          </TabsContent>\n\n          {/* Content Management Tab */}\n          <TabsContent value=\"content\" className=\"space-y-6\">\n            <Card>\n              <CardHeader>\n                <CardTitle>Hero Section</CardTitle>\n              </CardHeader>\n              <CardContent className=\"space-y-4\">\n                <div>\n                  <Label>Hero Title</Label>\n                  <Input \n                    defaultValue={content.hero_title}\n                    onBlur={(e) => updateContent('hero_title', e.target.value)}\n                  />\n                </div>\n                <div>\n                  <Label>Hero Subtitle</Label>\n                  <Textarea \n                    defaultValue={content.hero_subtitle}\n                    onBlur={(e) => updateContent('hero_subtitle', e.target.value)}\n                  />\n                </div>\n              </CardContent>\n            </Card>\n\n            <Card>\n              <CardHeader>\n                <CardTitle>About Us</CardTitle>\n              </CardHeader>\n              <CardContent>\n                <Textarea \n                  rows={6}\n                  defaultValue={content.about_us}\n                  onBlur={(e) => updateContent('about_us', e.target.value)}\n                />\n              </CardContent>\n            </Card>\n          </TabsContent>\n\n          {/* Members Tab */}\n          <TabsContent value=\"members\" className=\"space-y-6\">\n            <Card>\n              <CardHeader className=\"flex flex-row items-center justify-between\">\n                <div>\n                  <CardTitle>Members Management</CardTitle>\n                  <CardDescription>{members.length} total members</CardDescription>\n                </div>\n                <Button onClick={exportMembers} variant=\"outline\" size=\"sm\">\n                  <Download className=\"h-4 w-4 mr-2\" />\n                  Export CSV\n                </Button>\n              </CardHeader>\n              <CardContent>\n                <div className=\"overflow-x-auto\">\n                  <Table>\n                    <TableHeader>\n                      <TableRow>\n                        <TableHead>Name</TableHead>\n                        <TableHead>Email</TableHead>\n                        <TableHead>Tier</TableHead>\n                        <TableHead>Status</TableHead>\n                        <TableHead>Joined</TableHead>\n                        <TableHead>Actions</TableHead>\n                      </TableRow>\n                    </TableHeader>\n                    <TableBody>\n                      {members.map((member) => (\n                        <TableRow key={member.id}>\n                          <TableCell className=\"font-medium\">{member.name}</TableCell>\n                          <TableCell>{member.email}</TableCell>\n                          <TableCell>\n                            <span className=\"px-2 py-1 bg-gold/10 text-gold rounded text-xs\">\n                              {member.membershipTier}\n                            </span>\n                          </TableCell>\n                          <TableCell>\n                            <span className={`px-2 py-1 rounded text-xs ${\n                              member.status === 'approved' ? 'bg-green-100 text-green-700' :\n                              member.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :\n                              'bg-red-100 text-red-700'\n                            }`}>\n                              {member.status}\n                            </span>\n                          </TableCell>\n                          <TableCell className=\"text-sm text-gray-500\">\n                            {new Date(member.createdAt).toLocaleDateString()}\n                          </TableCell>\n                          <TableCell>\n                            <div className=\"flex gap-2\">\n                              {member.status === 'pending' && (\n                                <>\n                                  <Button \n                                    size=\"sm\" \n                                    variant=\"outline\"\n                                    onClick={() => updateMemberStatus(member.id, 'approved')}\n                                  >\n                                    <Check className=\"h-4 w-4\" />\n                                  </Button>\n                                  <Button \n                                    size=\"sm\" \n                                    variant=\"outline\"\n                                    onClick={() => updateMemberStatus(member.id, 'rejected')}\n                                  >\n                                    <X className=\"h-4 w-4\" />\n                                  </Button>\n                                </>\n                              )}\n                              <Button \n                                size=\"sm\" \n                                variant=\"destructive\"\n                                onClick={() => deleteMember(member.id)}\n                              >\n                                <Trash2 className=\"h-4 w-4\" />\n                              </Button>\n                            </div>\n                          </TableCell>\n                        </TableRow>\n                      ))}\n                    </TableBody>\n                  </Table>\n                </div>\n              </CardContent>\n            </Card>\n          </TabsContent>\n\n          {/* Payments Tab */}\n          <TabsContent value=\"payments\" className=\"space-y-6\">\n            <Card>\n              <CardHeader>\n                <CardTitle>Payment Transactions</CardTitle>\n                <CardDescription>{payments.length} total transactions</CardDescription>\n              </CardHeader>\n              <CardContent>\n                <div className=\"overflow-x-auto\">\n                  <Table>\n                    <TableHeader>\n                      <TableRow>\n                        <TableHead>Type</TableHead>\n                        <TableHead>Amount</TableHead>\n                        <TableHead>Status</TableHead>\n                        <TableHead>Date</TableHead>\n                        <TableHead>Order ID</TableHead>\n                      </TableRow>\n                    </TableHeader>\n                    <TableBody>\n                      {payments.map((payment) => (\n                        <TableRow key={payment.id}>\n                          <TableCell>\n                            <span className=\"px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs\">\n                              {payment.type}\n                            </span>\n                          </TableCell>\n                          <TableCell className=\"font-bold\">\n                            ₹{payment.amount}\n                          </TableCell>\n                          <TableCell>\n                            <span className={`px-2 py-1 rounded text-xs ${\n                              payment.status === 'paid' ? 'bg-green-100 text-green-700' :\n                              payment.status === 'created' ? 'bg-yellow-100 text-yellow-700' :\n                              'bg-red-100 text-red-700'\n                            }`}>\n                              {payment.status}\n                            </span>\n                          </TableCell>\n                          <TableCell className=\"text-sm text-gray-500\">\n                            {new Date(payment.createdAt).toLocaleDateString()}\n                          </TableCell>\n                          <TableCell className=\"text-xs text-gray-400\">\n                            {payment.razorpayOrderId || 'N/A'}\n                          </TableCell>\n                        </TableRow>\n                      ))}\n                    </TableBody>\n                  </Table>\n                </div>\n              </CardContent>\n            </Card>\n          </TabsContent>\n\n          {/* Goals Tab */}\n          <TabsContent value=\"goals\" className=\"space-y-6\">\n            <Card>\n              <CardHeader>\n                <CardTitle>Add New Goal</CardTitle>\n              </CardHeader>\n              <CardContent>\n                <form onSubmit={addGoal} className=\"space-y-4\">\n                  <div>\n                    <Label>Title</Label>\n                    <Input name=\"title\" required />\n                  </div>\n                  <div>\n                    <Label>Description</Label>\n                    <Textarea name=\"description\" required />\n                  </div>\n                  <Button type=\"submit\">\n                    <Plus className=\"h-4 w-4 mr-2\" />\n                    Add Goal\n                  </Button>\n                </form>\n              </CardContent>\n            </Card>\n\n            <Card>\n              <CardHeader>\n                <CardTitle>Current Goals ({goals.length})</CardTitle>\n              </CardHeader>\n              <CardContent>\n                <div className=\"space-y-4\">\n                  {goals.map((goal) => (\n                    <div key={goal.id} className=\"flex items-start justify-between p-4 border rounded-lg\">\n                      <div>\n                        <h4 className=\"font-semibold text-deep-blue\">{goal.title}</h4>\n                        <p className=\"text-sm text-gray-600\">{goal.description}</p>\n                      </div>\n                      <Button \n                        size=\"sm\" \n                        variant=\"destructive\"\n                        onClick={() => deleteGoal(goal.id)}\n                      >\n                        <Trash2 className=\"h-4 w-4\" />\n                      </Button>\n                    </div>\n                  ))}\n                </div>\n              </CardContent>\n            </Card>\n          </TabsContent>\n\n          {/* Initiatives Tab */}\n          <TabsContent value=\"initiatives\" className=\"space-y-6\">\n            <Card>\n              <CardHeader>\n                <CardTitle>Add New Initiative</CardTitle>\n              </CardHeader>\n              <CardContent>\n                <form onSubmit={addInitiative} className=\"space-y-4\">\n                  <div>\n                    <Label>Title</Label>\n                    <Input name=\"title\" required />\n                  </div>\n                  <div>\n                    <Label>Description</Label>\n                    <Textarea name=\"description\" required />\n                  </div>\n                  <div className=\"grid grid-cols-2 gap-4\">\n                    <div>\n                      <Label>Date</Label>\n                      <Input name=\"date\" type=\"date\" required />\n                    </div>\n                    <div>\n                      <Label>Location</Label>\n                      <Input name=\"location\" required />\n                    </div>\n                  </div>\n                  <Button type=\"submit\">\n                    <Plus className=\"h-4 w-4 mr-2\" />\n                    Add Initiative\n                  </Button>\n                </form>\n              </CardContent>\n            </Card>\n\n            <Card>\n              <CardHeader>\n                <CardTitle>Current Initiatives ({initiatives.length})</CardTitle>\n              </CardHeader>\n              <CardContent>\n                <div className=\"space-y-4\">\n                  {initiatives.map((initiative) => (\n                    <div key={initiative.id} className=\"flex items-start justify-between p-4 border rounded-lg\">\n                      <div>\n                        <h4 className=\"font-semibold text-deep-blue\">{initiative.title}</h4>\n                        <p className=\"text-sm text-gray-600\">{initiative.description}</p>\n                        <p className=\"text-xs text-gray-400 mt-2\">\n                          {new Date(initiative.date).toLocaleDateString()} • {initiative.location}\n                        </p>\n                      </div>\n                      <Button \n                        size=\"sm\" \n                        variant=\"destructive\"\n                        onClick={() => deleteInitiative(initiative.id)}\n                      >\n                        <Trash2 className=\"h-4 w-4\" />\n                      </Button>\n                    </div>\n                  ))}\n                </div>\n              </CardContent>\n            </Card>\n          </TabsContent>\n\n          {/* Email Tab */}\n          <TabsContent value=\"email\" className=\"space-y-6\">\n            <Card>\n              <CardHeader>\n                <CardTitle>Send Newsletter</CardTitle>\n                <CardDescription>\n                  This will send to all approved members ({members.filter(m => m.status === 'approved').length})\n                </CardDescription>\n              </CardHeader>\n              <CardContent>\n                <form onSubmit={sendNewsletter} className=\"space-y-4\">\n                  <div>\n                    <Label>Subject</Label>\n                    <Input name=\"subject\" required />\n                  </div>\n                  <div>\n                    <Label>Content (HTML)</Label>\n                    <Textarea name=\"content\" rows={8} required />\n                  </div>\n                  <Button type=\"submit\">\n                    <Mail className=\"h-4 w-4 mr-2\" />\n                    Send Newsletter\n                  </Button>\n                </form>\n              </CardContent>\n            </Card>\n\n            <Card>\n              <CardHeader>\n                <CardTitle>Email Logs ({emailLogs.length})</CardTitle>\n              </CardHeader>\n              <CardContent>\n                <div className=\"overflow-x-auto\">\n                  <Table>\n                    <TableHeader>\n                      <TableRow>\n                        <TableHead>Type</TableHead>\n                        <TableHead>Subject</TableHead>\n                        <TableHead>Status</TableHead>\n                        <TableHead>Sent At</TableHead>\n                      </TableRow>\n                    </TableHeader>\n                    <TableBody>\n                      {emailLogs.slice(0, 10).map((log) => (\n                        <TableRow key={log.id}>\n                          <TableCell>\n                            <span className=\"px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs\">\n                              {log.type}\n                            </span>\n                          </TableCell>\n                          <TableCell>{log.subject}</TableCell>\n                          <TableCell>\n                            <span className={`px-2 py-1 rounded text-xs ${\n                              log.status === 'sent' ? 'bg-green-100 text-green-700' :\n                              'bg-red-100 text-red-700'\n                            }`}>\n                              {log.status}\n                            </span>\n                          </TableCell>\n                          <TableCell className=\"text-sm text-gray-500\">\n                            {new Date(log.sentAt).toLocaleString()}\n                          </TableCell>\n                        </TableRow>\n                      ))}\n                    </TableBody>\n                  </Table>\n                </div>\n              </CardContent>\n            </Card>\n          </TabsContent>\n        </Tabs>\n      </div>\n    </div>\n  );\n}\n"}]