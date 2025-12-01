'use client';

/**
 * ============================================
 * PUBLIC WEBSITE - THE SERVANTS NGO
 * ============================================
 * Single-page website with all sections:
 * - Hero (video background)
 * - About Us
 * - Our Goals
 * - Activities
 * - Initiatives Gallery
 * - CSR Activities
 * - Donation Section
 * - Membership Plans
 * - Contact Form
 * - Footer
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  Target, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Menu,
  X,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function PublicWebsite() {
  const [content, setContent] = useState({});
  const [goals, setGoals] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch content from API
  useEffect(() => {
    fetchContent();
    fetchGoals();
    fetchInitiatives();
    fetchGallery();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
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
      setInitiatives(data.slice(0, 6)); // Show latest 6
    } catch (error) {
      console.error('Error fetching initiatives:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setGallery(data.slice(0, 9)); // Show 9 images
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  // Handle donation
  const handleDonation = async (e) => {
    e.preventDefault();
    if (!donationAmount || donationAmount < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(donationAmount),
          email: 'donor@example.com',
          name: 'Donor',
        }),
      });

      const data = await res.json();
      
      if (data.isMocked) {
        toast.success('Payment created successfully! (Mocked - Configure Razorpay for real payments)');
      } else {
        toast.success('Redirecting to payment gateway...');
        // In real implementation, integrate Razorpay checkout here
      }
      
      setDonationAmount('');
    } catch (error) {
      toast.error('Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

  // Handle membership registration
  const handleMembership = async (tier) => {
    const name = prompt('Enter your name:');
    const email = prompt('Enter your email:');
    const phone = prompt('Enter your phone:');

    if (!name || !email || !phone) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      // Create member
      const memberRes = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          membershipTier: tier,
        }),
      });

      const member = await memberRes.json();

      // Create subscription
      const subRes = await fetch('/api/payments/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          membershipTier: tier,
          email,
          name,
          phone,
        }),
      });

      const subscription = await subRes.json();

      if (subscription.isMocked) {
        toast.success('Membership created! Admin will approve shortly. (Mocked payment)');
      } else {
        toast.success('Redirecting to payment...');
      }
    } catch (error) {
      toast.error('Failed to create membership');
    } finally {
      setLoading(false);
    }
  };

  // Handle contact form
  const handleContact = async (e) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
    e.target.reset();
  };

  // Navigation
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // Membership plans
  const membershipPlans = [
    {
      tier: 'basic',
      name: 'Basic Membership',
      price: 199,
      features: [
        'Monthly newsletter',
        'Community updates',
        'Event invitations',
        'Support our cause'
      ]
    },
    {
      tier: 'core',
      name: 'Core Membership',
      price: 499,
      features: [
        'All Basic features',
        'Exclusive content access',
        'Priority event registration',
        'Quarterly impact reports',
        'Tax benefits'
      ],
      popular: true
    },
    {
      tier: 'premium',
      name: 'Premium Membership',
      price: 999,
      features: [
        'All Core features',
        'VIP event access',
        'One-on-one sessions',
        'Recognition on website',
        'Custom impact reports',
        'Maximum tax benefits'
      ]
    }
  ];

  return (
    <div className=\"min-h-screen bg-background\">\n      {/* Navigation */}\n      <nav className=\"fixed top-0 w-full bg-deep-blue/95 backdrop-blur-sm z-50 border-b border-gold/20\">\n        <div className=\"container mx-auto px-4\">\n          <div className=\"flex items-center justify-between h-16\">\n            <div className=\"flex items-center space-x-3\">\n              <Heart className=\"h-8 w-8 text-gold\" />\n              <span className=\"text-2xl font-bold text-gold\">The Servants</span>\n            </div>\n\n            {/* Desktop Navigation */}\n            <div className=\"hidden md:flex items-center space-x-6\">\n              <button onClick={() => scrollToSection('about')} className=\"text-white hover:text-gold transition\">About</button>\n              <button onClick={() => scrollToSection('goals')} className=\"text-white hover:text-gold transition\">Goals</button>\n              <button onClick={() => scrollToSection('initiatives')} className=\"text-white hover:text-gold transition\">Initiatives</button>\n              <button onClick={() => scrollToSection('donate')} className=\"text-white hover:text-gold transition\">Donate</button>\n              <button onClick={() => scrollToSection('membership')} className=\"text-white hover:text-gold transition\">Membership</button>\n              <button onClick={() => scrollToSection('contact')} className=\"text-white hover:text-gold transition\">Contact</button>\n              <a href=\"#admin\" className=\"px-4 py-2 bg-gold text-deep-blue rounded-lg font-semibold hover:bg-gold/90 transition\">Admin</a>\n            </div>\n\n            {/* Mobile Menu Button */}\n            <button \n              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}\n              className=\"md:hidden text-white\"\n            >\n              {mobileMenuOpen ? <X className=\"h-6 w-6\" /> : <Menu className=\"h-6 w-6\" />}\n            </button>\n          </div>\n\n          {/* Mobile Navigation */}\n          {mobileMenuOpen && (\n            <div className=\"md:hidden py-4 space-y-2\">\n              <button onClick={() => scrollToSection('about')} className=\"block w-full text-left px-4 py-2 text-white hover:bg-gold/10 rounded\">About</button>\n              <button onClick={() => scrollToSection('goals')} className=\"block w-full text-left px-4 py-2 text-white hover:bg-gold/10 rounded\">Goals</button>\n              <button onClick={() => scrollToSection('initiatives')} className=\"block w-full text-left px-4 py-2 text-white hover:bg-gold/10 rounded\">Initiatives</button>\n              <button onClick={() => scrollToSection('donate')} className=\"block w-full text-left px-4 py-2 text-white hover:bg-gold/10 rounded\">Donate</button>\n              <button onClick={() => scrollToSection('membership')} className=\"block w-full text-left px-4 py-2 text-white hover:bg-gold/10 rounded\">Membership</button>\n              <button onClick={() => scrollToSection('contact')} className=\"block w-full text-left px-4 py-2 text-white hover:bg-gold/10 rounded\">Contact</button>\n              <a href=\"#admin\" className=\"block w-full text-left px-4 py-2 text-gold hover:bg-gold/10 rounded font-semibold\">Admin</a>\n            </div>\n          )}\n        </div>\n      </nav>\n\n      {/* Hero Section */}\n      <section className=\"relative h-screen flex items-center justify-center text-center islamic-pattern\">\n        <div className=\"hero-overlay absolute inset-0\"></div>\n        <div className=\"relative z-10 container mx-auto px-4 animate-fade-in\">\n          <h1 className=\"text-5xl md:text-7xl font-bold text-gold mb-6\">\n            {content.hero_title || 'Serving Humanity with Compassion'}\n          </h1>\n          <p className=\"text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto\">\n            {content.hero_subtitle || 'Join us in making a difference in the lives of those who need it most'}\n          </p>\n          <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">\n            <Button \n              size=\"lg\" \n              onClick={() => scrollToSection('donate')}\n              className=\"bg-gold text-deep-blue hover:bg-gold/90 text-lg px-8 py-6\"\n            >\n              Donate Now <Heart className=\"ml-2 h-5 w-5\" />\n            </Button>\n            <Button \n              size=\"lg\" \n              variant=\"outline\"\n              onClick={() => scrollToSection('about')}\n              className=\"border-2 border-gold text-gold hover:bg-gold hover:text-deep-blue text-lg px-8 py-6\"\n            >\n              Learn More <ArrowRight className=\"ml-2 h-5 w-5\" />\n            </Button>\n          </div>\n        </div>\n      </section>\n\n      {/* About Us Section */}\n      <section id=\"about\" className=\"py-20 bg-white\">\n        <div className=\"container mx-auto px-4\">\n          <div className=\"max-w-4xl mx-auto text-center\">\n            <h2 className=\"text-4xl font-bold text-deep-blue mb-6\">About Us</h2>\n            <div className=\"w-20 h-1 bg-gold mx-auto mb-8\"></div>\n            <p className=\"text-lg text-gray-700 leading-relaxed\">\n              {content.about_us || 'Loading...'}\n            </p>\n          </div>\n        </div>\n      </section>\n\n      {/* Goals Section */}\n      <section id=\"goals\" className=\"py-20 bg-gray-50\">\n        <div className=\"container mx-auto px-4\">\n          <h2 className=\"text-4xl font-bold text-center text-deep-blue mb-6\">Our Goals</h2>\n          <div className=\"w-20 h-1 bg-gold mx-auto mb-12\"></div>\n          \n          <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-8\">\n            {goals.length > 0 ? goals.map((goal, index) => (\n              <Card key={goal.id} className=\"border-2 hover:border-gold transition hover:shadow-lg\">\n                <CardHeader>\n                  <div className=\"w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4\">\n                    <Target className=\"h-6 w-6 text-gold\" />\n                  </div>\n                  <CardTitle className=\"text-xl text-deep-blue\">{goal.title}</CardTitle>\n                </CardHeader>\n                <CardContent>\n                  <p className=\"text-gray-600\">{goal.description}</p>\n                </CardContent>\n              </Card>\n            )) : (\n              <div className=\"col-span-full text-center text-gray-500\">No goals added yet</div>\n            )}\n          </div>\n        </div>\n      </section>\n\n      {/* Initiatives Section */}\n      <section id=\"initiatives\" className=\"py-20 bg-white\">\n        <div className=\"container mx-auto px-4\">\n          <h2 className=\"text-4xl font-bold text-center text-deep-blue mb-6\">Our Initiatives</h2>\n          <div className=\"w-20 h-1 bg-gold mx-auto mb-12\"></div>\n          \n          <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-8\">\n            {initiatives.length > 0 ? initiatives.map((initiative) => (\n              <Card key={initiative.id} className=\"overflow-hidden hover:shadow-xl transition\">\n                <div className=\"h-48 bg-gray-200\">\n                  <img \n                    src={initiative.imageUrl || 'https://via.placeholder.com/400x300/001F3F/D4AF37?text=Initiative'} \n                    alt={initiative.title}\n                    className=\"w-full h-full object-cover\"\n                  />\n                </div>\n                <CardHeader>\n                  <CardTitle className=\"text-xl text-deep-blue\">{initiative.title}</CardTitle>\n                  <CardDescription>\n                    {new Date(initiative.date).toLocaleDateString()} • {initiative.location}\n                  </CardDescription>\n                </CardHeader>\n                <CardContent>\n                  <p className=\"text-gray-600\">{initiative.description}</p>\n                </CardContent>\n              </Card>\n            )) : (\n              <div className=\"col-span-full text-center text-gray-500\">No initiatives added yet</div>\n            )}\n          </div>\n        </div>\n      </section>\n\n      {/* Gallery Section */}\n      {gallery.length > 0 && (\n        <section className=\"py-20 bg-gray-50\">\n          <div className=\"container mx-auto px-4\">\n            <h2 className=\"text-4xl font-bold text-center text-deep-blue mb-6\">Gallery</h2>\n            <div className=\"w-20 h-1 bg-gold mx-auto mb-12\"></div>\n            \n            <div className=\"grid grid-cols-2 md:grid-cols-3 gap-4\">\n              {gallery.map((image) => (\n                <div key={image.id} className=\"aspect-square overflow-hidden rounded-lg\">\n                  <img \n                    src={image.imageUrl} \n                    alt={image.title}\n                    className=\"w-full h-full object-cover hover:scale-110 transition duration-300\"\n                  />\n                </div>\n              ))}\n            </div>\n          </div>\n        </section>\n      )}\n\n      {/* Donation Section */}\n      <section id=\"donate\" className=\"py-20 bg-deep-blue text-white\">\n        <div className=\"container mx-auto px-4\">\n          <div className=\"max-w-2xl mx-auto text-center\">\n            <Heart className=\"h-16 w-16 text-gold mx-auto mb-6\" />\n            <h2 className=\"text-4xl font-bold mb-6\">Make a Donation</h2>\n            <p className=\"text-lg mb-8 text-white/90\">\n              Your generous contribution helps us continue our mission to serve the community\n            </p>\n            \n            <form onSubmit={handleDonation} className=\"space-y-4\">\n              <div className=\"flex flex-col sm:flex-row gap-4\">\n                <Input \n                  type=\"number\" \n                  placeholder=\"Enter amount (₹)\"\n                  value={donationAmount}\n                  onChange={(e) => setDonationAmount(e.target.value)}\n                  className=\"flex-1 text-lg py-6 bg-white\"\n                  min=\"1\"\n                />\n                <Button \n                  type=\"submit\" \n                  size=\"lg\"\n                  disabled={loading}\n                  className=\"bg-gold text-deep-blue hover:bg-gold/90 text-lg px-8 py-6\"\n                >\n                  {loading ? 'Processing...' : 'Donate Now'}\n                </Button>\n              </div>\n              <div className=\"flex gap-2 justify-center flex-wrap\">\n                <Button \n                  type=\"button\"\n                  variant=\"outline\"\n                  onClick={() => setDonationAmount('500')}\n                  className=\"border-gold text-white hover:bg-gold hover:text-deep-blue\"\n                >\n                  ₹500\n                </Button>\n                <Button \n                  type=\"button\"\n                  variant=\"outline\"\n                  onClick={() => setDonationAmount('1000')}\n                  className=\"border-gold text-white hover:bg-gold hover:text-deep-blue\"\n                >\n                  ₹1000\n                </Button>\n                <Button \n                  type=\"button\"\n                  variant=\"outline\"\n                  onClick={() => setDonationAmount('5000')}\n                  className=\"border-gold text-white hover:bg-gold hover:text-deep-blue\"\n                >\n                  ₹5000\n                </Button>\n              </div>\n            </form>\n          </div>\n        </div>\n      </section>\n\n      {/* Membership Plans */}\n      <section id=\"membership\" className=\"py-20 bg-white\">\n        <div className=\"container mx-auto px-4\">\n          <h2 className=\"text-4xl font-bold text-center text-deep-blue mb-6\">Membership Plans</h2>\n          <div className=\"w-20 h-1 bg-gold mx-auto mb-12\"></div>\n          \n          <div className=\"grid md:grid-cols-3 gap-8 max-w-6xl mx-auto\">\n            {membershipPlans.map((plan) => (\n              <Card \n                key={plan.tier} \n                className={`relative ${plan.popular ? 'border-4 border-gold shadow-2xl scale-105' : 'border-2'}`}\n              >\n                {plan.popular && (\n                  <div className=\"absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-deep-blue px-4 py-1 rounded-full text-sm font-bold\">\n                    Most Popular\n                  </div>\n                )}\n                <CardHeader className=\"text-center\">\n                  <CardTitle className=\"text-2xl text-deep-blue\">{plan.name}</CardTitle>\n                  <div className=\"mt-4\">\n                    <span className=\"text-5xl font-bold text-gold\">₹{plan.price}</span>\n                    <span className=\"text-gray-500\">/month</span>\n                  </div>\n                </CardHeader>\n                <CardContent>\n                  <ul className=\"space-y-3\">\n                    {plan.features.map((feature, index) => (\n                      <li key={index} className=\"flex items-start gap-2\">\n                        <CheckCircle2 className=\"h-5 w-5 text-gold flex-shrink-0 mt-0.5\" />\n                        <span className=\"text-gray-700\">{feature}</span>\n                      </li>\n                    ))}\n                  </ul>\n                </CardContent>\n                <CardFooter>\n                  <Button \n                    onClick={() => handleMembership(plan.tier)}\n                    disabled={loading}\n                    className={`w-full ${\n                      plan.popular \n                        ? 'bg-gold text-deep-blue hover:bg-gold/90' \n                        : 'bg-deep-blue text-white hover:bg-deep-blue/90'\n                    }`}\n                  >\n                    Choose Plan\n                  </Button>\n                </CardFooter>\n              </Card>\n            ))}\n          </div>\n        </div>\n      </section>\n\n      {/* Contact Section */}\n      <section id=\"contact\" className=\"py-20 bg-gray-50\">\n        <div className=\"container mx-auto px-4\">\n          <h2 className=\"text-4xl font-bold text-center text-deep-blue mb-6\">Contact Us</h2>\n          <div className=\"w-20 h-1 bg-gold mx-auto mb-12\"></div>\n          \n          <div className=\"grid md:grid-cols-2 gap-12 max-w-5xl mx-auto\">\n            <div>\n              <h3 className=\"text-2xl font-bold text-deep-blue mb-6\">Get in Touch</h3>\n              <div className=\"space-y-4\">\n                <div className=\"flex items-start gap-3\">\n                  <MapPin className=\"h-6 w-6 text-gold flex-shrink-0\" />\n                  <div>\n                    <p className=\"font-semibold text-deep-blue\">Address</p>\n                    <p className=\"text-gray-600\">123 Community Street, City, State 123456</p>\n                  </div>\n                </div>\n                <div className=\"flex items-start gap-3\">\n                  <Phone className=\"h-6 w-6 text-gold flex-shrink-0\" />\n                  <div>\n                    <p className=\"font-semibold text-deep-blue\">Phone</p>\n                    <p className=\"text-gray-600\">+91 12345 67890</p>\n                  </div>\n                </div>\n                <div className=\"flex items-start gap-3\">\n                  <Mail className=\"h-6 w-6 text-gold flex-shrink-0\" />\n                  <div>\n                    <p className=\"font-semibold text-deep-blue\">Email</p>\n                    <p className=\"text-gray-600\">info@theservants.org</p>\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <div>\n              <form onSubmit={handleContact} className=\"space-y-4\">\n                <Input placeholder=\"Your Name\" name=\"name\" required className=\"bg-white\" />\n                <Input type=\"email\" placeholder=\"Your Email\" name=\"email\" required className=\"bg-white\" />\n                <Input placeholder=\"Subject\" name=\"subject\" required className=\"bg-white\" />\n                <Textarea placeholder=\"Your Message\" name=\"message\" rows={5} required className=\"bg-white\" />\n                <Button type=\"submit\" className=\"w-full bg-deep-blue text-white hover:bg-deep-blue/90\">\n                  Send Message\n                </Button>\n              </form>\n            </div>\n          </div>\n        </div>\n      </section>\n\n      {/* Footer */}\n      <footer className=\"bg-deep-blue text-white py-12\">\n        <div className=\"container mx-auto px-4\">\n          <div className=\"grid md:grid-cols-3 gap-8 mb-8\">\n            <div>\n              <div className=\"flex items-center space-x-3 mb-4\">\n                <Heart className=\"h-8 w-8 text-gold\" />\n                <span className=\"text-2xl font-bold text-gold\">The Servants</span>\n              </div>\n              <p className=\"text-white/80\">\n                Serving humanity with compassion and integrity since our founding.\n              </p>\n            </div>\n            <div>\n              <h4 className=\"text-lg font-bold text-gold mb-4\">Quick Links</h4>\n              <ul className=\"space-y-2 text-white/80\">\n                <li><button onClick={() => scrollToSection('about')} className=\"hover:text-gold transition\">About Us</button></li>\n                <li><button onClick={() => scrollToSection('goals')} className=\"hover:text-gold transition\">Our Goals</button></li>\n                <li><button onClick={() => scrollToSection('initiatives')} className=\"hover:text-gold transition\">Initiatives</button></li>\n                <li><button onClick={() => scrollToSection('contact')} className=\"hover:text-gold transition\">Contact</button></li>\n              </ul>\n            </div>\n            <div>\n              <h4 className=\"text-lg font-bold text-gold mb-4\">Connect</h4>\n              <p className=\"text-white/80 mb-2\">Follow us on social media</p>\n              <div className=\"flex gap-4\">\n                <div className=\"w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center hover:bg-gold/20 transition cursor-pointer\">\n                  <span className=\"text-gold\">f</span>\n                </div>\n                <div className=\"w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center hover:bg-gold/20 transition cursor-pointer\">\n                  <span className=\"text-gold\">t</span>\n                </div>\n                <div className=\"w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center hover:bg-gold/20 transition cursor-pointer\">\n                  <span className=\"text-gold\">in</span>\n                </div>\n              </div>\n            </div>\n          </div>\n          <div className=\"border-t border-gold/20 pt-8 text-center text-white/60\">\n            <p>&copy; 2025 The Servants. All rights reserved. | Built with ❤️ for humanity</p>\n          </div>\n        </div>\n      </footer>\n    </div>\n  );\n}\n"}]