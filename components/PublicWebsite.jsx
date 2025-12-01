'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Target, CheckCircle2, Mail, Phone, MapPin, Menu, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicWebsite() {
  const [content, setContent] = useState({});
  const [goals, setGoals] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentRes, goalsRes, initiativesRes] = await Promise.all([
        fetch('/api/content'),
        fetch('/api/goals'),
        fetch('/api/initiatives')
      ]);
      
      setContent(await contentRes.json());
      setGoals(await goalsRes.json());
      setInitiatives(await initiativesRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    if (!donationAmount || donationAmount < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const res = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(donationAmount), email: 'donor@example.com', name: 'Donor' }),
      });
      const data = await res.json();
      toast.success(data.isMocked ? 'Payment created (Mocked)' : 'Redirecting to payment...');
      setDonationAmount('');
    } catch (error) {
      toast.error('Failed to process donation');
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const membershipPlans = [
    { tier: 'basic', name: 'Basic', price: 199, features: ['Monthly newsletter', 'Community updates', 'Event invitations'] },
    { tier: 'core', name: 'Core', price: 499, features: ['All Basic features', 'Exclusive content', 'Priority events'], popular: true },
    { tier: 'premium', name: 'Premium', price: 999, features: ['All Core features', 'VIP access', 'Recognition'] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full bg-deep-blue/95 backdrop-blur-sm z-50 border-b border-gold/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-gold" />
              <span className="text-2xl font-bold text-gold">The Servants</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => scrollTo('about')} className="text-white hover:text-gold">About</button>
              <button onClick={() => scrollTo('goals')} className="text-white hover:text-gold">Goals</button>
              <button onClick={() => scrollTo('donate')} className="text-white hover:text-gold">Donate</button>
              <button onClick={() => scrollTo('membership')} className="text-white hover:text-gold">Membership</button>
              <a href="#admin" className="px-4 py-2 bg-gold text-deep-blue rounded-lg font-semibold">Admin</a>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <button onClick={() => scrollTo('about')} className="block w-full text-left px-4 py-2 text-white hover:bg-gold/10">About</button>
              <button onClick={() => scrollTo('goals')} className="block w-full text-left px-4 py-2 text-white hover:bg-gold/10">Goals</button>
              <button onClick={() => scrollTo('donate')} className="block w-full text-left px-4 py-2 text-white hover:bg-gold/10">Donate</button>
              <a href="#admin" className="block w-full text-left px-4 py-2 text-gold font-semibold">Admin</a>
            </div>
          )}
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center text-center islamic-pattern">
        <div className="hero-overlay absolute inset-0"></div>
        <div className="relative z-10 container mx-auto px-4 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-gold mb-6">
            {content.hero_title || 'Serving Humanity with Compassion'}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            {content.hero_subtitle || 'Join us in making a difference'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => scrollTo('donate')} className="bg-gold text-deep-blue hover:bg-gold/90 text-lg px-8 py-6">
              Donate Now <Heart className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo('about')} className="border-2 border-gold text-gold hover:bg-gold hover:text-deep-blue text-lg px-8 py-6">
              Learn More <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-deep-blue mb-6">About Us</h2>
            <div className="w-20 h-1 bg-gold mx-auto mb-8"></div>
            <p className="text-lg text-gray-700 leading-relaxed">{content.about_us || 'Loading...'}</p>
          </div>
        </div>
      </section>

      <section id="goals" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-deep-blue mb-6">Our Goals</h2>
          <div className="w-20 h-1 bg-gold mx-auto mb-12"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goals.length > 0 ? goals.map((goal) => (
              <Card key={goal.id} className="border-2 hover:border-gold transition">
                <CardHeader>
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-gold" />
                  </div>
                  <CardTitle className="text-xl text-deep-blue">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{goal.description}</p>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center text-gray-500">No goals added yet</div>
            )}
          </div>
        </div>
      </section>

      <section id="donate" className="py-20 bg-deep-blue text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="h-16 w-16 text-gold mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">Make a Donation</h2>
            <p className="text-lg mb-8 text-white/90">Your contribution helps us continue our mission</p>
            <form onSubmit={handleDonation} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input type="number" placeholder="Enter amount (₹)" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} className="flex-1 text-lg py-6 bg-white" min="1" />
                <Button type="submit" size="lg" className="bg-gold text-deep-blue hover:bg-gold/90 text-lg px-8 py-6">Donate Now</Button>
              </div>
              <div className="flex gap-2 justify-center">
                {[500, 1000, 5000].map((amt) => (
                  <Button key={amt} type="button" variant="outline" onClick={() => setDonationAmount(amt.toString())} className="border-gold text-white hover:bg-gold hover:text-deep-blue">₹{amt}</Button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section id="membership" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-deep-blue mb-6">Membership Plans</h2>
          <div className="w-20 h-1 bg-gold mx-auto mb-12"></div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {membershipPlans.map((plan) => (
              <Card key={plan.tier} className={plan.popular ? 'border-4 border-gold shadow-2xl scale-105' : 'border-2'}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-deep-blue px-4 py-1 rounded-full text-sm font-bold">Most Popular</div>}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-deep-blue">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-gold">₹{plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className={`w-full ${plan.popular ? 'bg-gold text-deep-blue hover:bg-gold/90' : 'bg-deep-blue text-white hover:bg-deep-blue/90'}`}>Choose Plan</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-deep-blue text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Heart className="h-8 w-8 text-gold" />
            <span className="text-2xl font-bold text-gold">The Servants</span>
          </div>
          <p className="text-white/60">&copy; 2025 The Servants. All rights reserved. | Built with ❤️ for humanity</p>
        </div>
      </footer>
    </div>
  );
}
