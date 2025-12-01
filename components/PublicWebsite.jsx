'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, ArrowUp, Menu, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicWebsite() {
  const [content, setContent] = useState({});
  const [goals, setGoals] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    fetchData();
    
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      const [contentRes, goalsRes, initiativesRes, galleryRes] = await Promise.all([
        fetch('/api/content'),
        fetch('/api/goals'),
        fetch('/api/initiatives'),
        fetch('/api/gallery')
      ]);
      
      setContent(await contentRes.json());
      setGoals(await goalsRes.json());
      setInitiatives(await initiativesRes.json());
      setGallery(await galleryRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
    e.target.reset();
  };

  // Default goals with images if none in database
  const defaultGoals = [
    {
      id: '1',
      title: 'EDUCATION',
      description: 'Knowledge is Love and Cure!',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      points: [
        'Providing means for quality education.',
        'To build competitive environment and promote analytical thinking among students.',
        'Establishing scientific and religious libraries.'
      ]
    },
    {
      id: '2',
      title: 'EMPLOYMENT',
      description: 'Creating Opportunities',
      imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
      points: [
        'Creating job opportunities.',
        'Providing financial and technical support to local startups and businesses.'
      ]
    },
    {
      id: '3',
      title: 'INTERNSHIP',
      description: 'Building Skills',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      points: [
        'Provide platforms for students to build up skills through technical and industrial trainings.',
        'Provide support for advanced industrial and technical training.'
      ]
    },
    {
      id: '4',
      title: 'CSR ACTIVITIES',
      description: 'Social Responsibility',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      points: ['Planting more than 10,000 trees across the city.']
    }
  ];

  const displayGoals = goals.length > 0 ? goals : defaultGoals;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Video Background */}
      <header id="home" className="relative h-screen overflow-hidden">
        {/* Navigation */}
        <nav className="absolute top-0 w-full z-50 bg-gradient-to-b from-black/70 to-transparent">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <img src="/img/Color logo with background.png" alt="The Servants" className="h-16 w-auto" onError={(e) => e.target.style.display = 'none'} />
              
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => window.location.href = '/payment'} className="text-white hover:text-gold transition font-semibold">Donate</button>
                <button onClick={() => scrollTo('goals')} className="text-white hover:text-gold transition">GOALS</button>
                <button onClick={() => scrollTo('initiatives')} className="text-white hover:text-gold transition">Initiatives</button>
                <button onClick={() => scrollTo('contact')} className="text-white hover:text-gold transition">Contact</button>
                <a href="#admin" className="px-4 py-2 bg-gold text-deep-blue rounded-lg font-semibold hover:bg-gold/90">Admin</a>
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white z-50">
                {mobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 w-full bg-deep-blue/95 backdrop-blur-md py-4 space-y-2">
                <button onClick={() => window.location.href = '/payment'} className="block w-full text-left px-4 py-3 text-white hover:bg-gold/10">Donate</button>
                <button onClick={() => scrollTo('goals')} className="block w-full text-left px-4 py-3 text-white hover:bg-gold/10">GOALS</button>
                <button onClick={() => scrollTo('initiatives')} className="block w-full text-left px-4 py-3 text-white hover:bg-gold/10">Initiatives</button>
                <button onClick={() => scrollTo('contact')} className="block w-full text-left px-4 py-3 text-white hover:bg-gold/10">Contact</button>
                <a href="#admin" className="block w-full text-left px-4 py-3 text-gold font-semibold">Admin</a>
              </div>
            )}
          </div>
        </nav>

        {/* Video Background */}
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/video/theservants.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-b from-deep-blue/50 via-deep-blue/70 to-deep-blue"></div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
            IN YOUR <span className="text-gold">SERVICE.</span> WE ARE.
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={() => scrollTo('goals')} className="bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-deep-blue text-lg px-8 py-6">
              OUR GOALS
            </Button>
            <Button size="lg" onClick={() => window.location.href = '/payment'} className="bg-gold text-deep-blue hover:bg-gold/90 text-lg px-8 py-6">
              DONATE
            </Button>
          </div>
          
          <button onClick={() => scrollTo('about')} className="absolute bottom-10 animate-bounce">
            <ChevronDown className="h-12 w-12 text-gold" />
          </button>
        </div>
      </header>

      {/* About Us */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-deep-blue mb-6">About Us</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {content.about_us || `The Servants is a group of serious and committed people of the community, who are determined to pave the way for the reappearance of the Imam(A.S) of our time. Experts believe that the greatest asset of any nation and community is its young generation. It's because the responsibility for the development of the community rests on the shoulders of the youth of the community. That is why in every age the youth of the community has been on the target of the enemy. The Servants Group is committed to protect this precious asset.`}
              </p>
            </div>
            <div className="flex justify-center">
              <img src="/img/Color logo with background.png" alt="The Servants" className="max-w-md w-full" onError={(e) => e.target.src = 'https://via.placeholder.com/400x400/001F3F/D4AF37?text=The+Servants'} />
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-deep-blue text-white">
        <div className="container mx-auto px-4">
          <p className="text-xl md:text-2xl text-center italic leading-relaxed">
            "Significance of the deeds that you have finished with a dread of Allah can't be limited, and by what method can the acts which are worthy to Allah be viewed as immaterial" 
            <span className="block mt-4 text-gold font-semibold">~ IMAM ALI(A.S.)</span>
          </p>
        </div>
      </section>

      {/* Goals Section */}
      <section id="goals" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-center text-deep-blue mb-16 uppercase">Our Goals</h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayGoals.map((goal) => (
              <Card key={goal.id} className="overflow-hidden hover:shadow-2xl transition-shadow">
                <div className="relative h-64 overflow-hidden group">
                  <img 
                    src={goal.imageUrl || 'https://via.placeholder.com/400x300/001F3F/D4AF37'} 
                    alt={goal.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/90 to-transparent flex items-end p-4">
                    <h3 className="text-gold text-sm font-semibold">{goal.description || goal.title}</h3>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-deep-blue">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-gray-700">
                    {(goal.points || [goal.description]).map((point, idx) => (
                      <li key={idx} className="flex">
                        <span className="font-bold mr-2">{idx + 1}.</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Initiatives Gallery */}
      <section id="initiatives" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-center text-deep-blue mb-16 uppercase">Our Initiatives</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {gallery.length > 0 ? gallery.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm">{item.description}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-deep-blue/80 text-white text-center py-2 text-sm font-semibold">
                  {item.title}
                </div>
              </div>
            )) : (
              <>
                {['Quran Classes', 'Coaching', 'CSR Activity', 'DARS', 'Blood Donation', 'Sadqa Collection'].map((title, idx) => (
                  <div key={idx} className="group relative overflow-hidden rounded-lg shadow-lg">
                    <img 
                      src={`https://images.unsplash.com/photo-${1500000000000 + idx}?w=400&h=300&fit=crop`}
                      alt={title}
                      className="w-full h-64 object-cover"
                      onError={(e) => e.target.src = `https://via.placeholder.com/400x300/001F3F/D4AF37?text=${encodeURIComponent(title)}`}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-deep-blue/80 text-white text-center py-2 text-sm font-semibold">
                      {title}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl text-deep-blue">Contact Us</CardTitle>
                <CardDescription className="text-lg">
                  If you have any questions, please feel free to contact us. We will answer as soon as possible!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your name</label>
                    <Input id="name" name="name" required className="w-full" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Your e-mail</label>
                    <Input id="email" name="email" type="email" required className="w-full" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Your message</label>
                    <Textarea id="message" name="message" rows={5} required className="w-full" />
                  </div>
                  <Button type="submit" className="w-full bg-deep-blue text-white hover:bg-deep-blue/90 text-lg py-6">
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Establishment Quote */}
      <section className="py-16 bg-deep-blue text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <img src="/img/logo.png" alt="Logo" className="max-w-xs" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gold mb-4">Establishment</h3>
              <p className="text-lg leading-relaxed">
                With the blessings of Almighty and Ahlul Bayt, <span className="font-bold text-gold">The Servants</span> Group came into existence on 1st August 2021 in the city of Jaunpur. In pursuit of its goals, the Servants have begun their regular work for the welfare of society.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => scrollTo('home')}
          className="fixed bottom-8 right-8 bg-gold text-deep-blue p-4 rounded-full shadow-lg hover:bg-gold/90 transition-all z-50 animate-bounce"
          aria-label="Back to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}

      {/* Footer */}
      <footer className="bg-deep-blue text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/80">&copy; 2025 The Servants. All rights reserved. | Built with ❤️ for humanity</p>
        </div>
      </footer>
    </div>
  );
}
