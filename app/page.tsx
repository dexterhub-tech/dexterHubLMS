'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MapPin, Mail, Phone, Search, ShoppingCart, 
  Play, Tag, ArrowRight, ArrowUpRight, 
  Clock, BookOpen, Star, Heart, Lightbulb, TrendingUp, MonitorPlay,
  ShieldCheck, Megaphone, BarChart3, Layout, Code, Quote, MessageSquare, Send,
  Twitter, Linkedin, Github, User, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    setIsLoadingCourses(true);
    try {
      const data = await api.searchPublicCourses(searchQuery);
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch public courses:', error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin' || user?.role === 'super-admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      
      {/* Top Bar */}
      {/* <div className="bg-[#4F46E5] text-white/90 text-[13px] py-2.5 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-300" />
            <span>664 Kampala, Uganda E-learning Platform</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-300" />
              <span>support@example.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-300" />
              <span>+1 (000) 444 7890</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-lg md:text-3xl font-bold tracking-tight text-slate-900 flex items-center">
              <span className="text-orange-500">Dexter</span>Hub
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 font-semibold text-[15px] text-slate-700">
            <Link href="#" className="text-[#4F46E5] border-b-2 border-[#4F46E5] py-1">Home</Link>
            <Link href="#" className="hover:text-[#4F46E5] py-1">About</Link>
            <Link href="#" className="hover:text-[#4F46E5] py-1">Course</Link>
            <Link href="#" className="hover:text-[#4F46E5] py-1">Team</Link>
            <Link href="#" className="hover:text-[#4F46E5] py-1">Testimonial</Link>
            <Link href="#" className="hover:text-[#4F46E5] py-1">Blog</Link>
            <Link href="#" className="hover:text-[#4F46E5] py-1">Contact</Link>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <button className="hidden lg:flex w-10 h-10 items-center justify-center hover:bg-slate-100 rounded-full transition-colors border border-slate-200">
              <Search className="w-4 h-4" />
            </button>
            <button className="hidden lg:flex w-10 h-10 items-center justify-center hover:bg-slate-100 rounded-full transition-colors border border-slate-200">
              <ShoppingCart className="w-4 h-4" />
            </button>
            
            <div className="hidden md:flex items-center gap-3 ml-2">
              <Link href="/login">
                <Button variant="outline" className="rounded-full px-6 h-10 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold hover:text-[#4F46E5]">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-6 h-10 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200">
                  Register
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl z-50 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col p-6 gap-4 font-semibold text-slate-700">
              <Link href="#" className="text-[#4F46E5] py-2 border-b border-slate-50" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link href="#" className="hover:text-[#4F46E5] py-2 border-b border-slate-50" onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link href="#" className="hover:text-[#4F46E5] py-2 border-b border-slate-50" onClick={() => setIsMenuOpen(false)}>Course</Link>
              <Link href="#" className="hover:text-[#4F46E5] py-2 border-b border-slate-50" onClick={() => setIsMenuOpen(false)}>Team</Link>
              <Link href="#" className="hover:text-[#4F46E5] py-2 border-b border-slate-50" onClick={() => setIsMenuOpen(false)}>Testimonial</Link>
              <div className="flex items-center gap-3 pt-4">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full rounded-full h-12 border-slate-300 text-slate-700" onClick={() => setIsMenuOpen(false)}>Login</Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button className="w-full rounded-full h-12 bg-[#4F46E5] text-white" onClick={() => setIsMenuOpen(false)}>Register</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10 overflow-hidden">
        
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          {/* Background circles */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/4" />
          <div className="absolute top-1/4 right-[10%] w-[500px] h-[500px] border-[40px] border-indigo-50/80 rounded-full -z-10" />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 relative z-10">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Our Online Class <br /> 
                Will Grow Your <br />
                <span className="text-[#4F46E5]">Skills.</span>
              </h1>
              
              <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                DexterHub is your all-in-one Convenience of online education platform,
                allowing learners to acquire new skills at their own pace and from any location.
              </p>

              <div className="flex items-center gap-4">
                <Button className="rounded-full px-8 h-14 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-lg shadow-xl shadow-indigo-200/50 flex items-center gap-2">
                  Enroll Now <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </div>

              {/* Tags */}
              <div className="flex gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm text-sm font-semibold text-slate-700">
                  <MonitorPlay className="w-4 h-4 text-[#4F46E5]" /> Quality Video
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm text-sm font-semibold text-slate-700">
                  <Tag className="w-4 h-4 text-orange-500" /> Suitable Price
                </div>
              </div>

              {/* Search Box */}
              <div className="bg-white p-2 rounded-full shadow-lg border border-slate-100 flex items-center max-w-xl z-20 relative">
                <div className="px-4 py-2 border-r border-slate-200 text-sm font-medium text-slate-500 min-w-[140px] hidden sm:block">
                  All Categories <span className="float-right text-xs">▼</span>
                </div>
                <input 
                  type="text" 
                  placeholder="Search Courses" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 outline-none text-slate-700 bg-transparent placeholder:text-slate-400"
                />
                <Button onClick={handleSearch} className="rounded-full px-8 h-12 bg-[#818cf8] hover:bg-[#6366f1] text-white font-semibold">
                  Search
                </Button>
              </div>

              {/* Topic Pills */}
              <div className="flex flex-wrap gap-3">
                {['Accounting', 'Business', 'Development', 'Marketing', 'Meditation'].map((topic) => (
                  <span key={topic} className="px-4 py-2 bg-[#F8F9FE] text-slate-600 text-sm font-medium rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Content - Hero Image Area */}
            <div className="relative z-10 hidden lg:block h-[600px]">
              {/* Replace with actual image in production */}
              <div className="absolute inset-0 bg-slate-200 rounded-[3rem] overflow-hidden flex items-end justify-center">
                {/* Mock image content */}
                <div className="w-full h-full relative">
                  <Image 
                    src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=1000&auto=format&fit=crop" 
                    alt="Student" 
                    fill 
                    className="object-cover object-top"
                  />
                </div>
              </div>

              {/* Floating Element 1 - Top Mentor */}
              <Card className="absolute top-1/4 -left-12 p-4 rounded-2xl shadow-xl border-none w-48 flex items-center gap-3 animate-bounce" style={{animationDuration: '3s'}}>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1 whitespace-nowrap overflow-hidden text-ellipsis">Top Mentor</div>
                  <div className="text-xs text-slate-500">Chris Isaac</div>
                  <div className="flex mt-1">
                    {[1,2,3,4].map(i => <Star key={i} className="w-3 h-3 text-orange-400 fill-orange-400" />)}
                  </div>
                </div>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
              </Card>

              {/* Floating Element 2 - Success Students */}
              <Card className="absolute top-1/3 -right-8 p-4 rounded-2xl shadow-xl border-none w-48">
                <div className="flex -space-x-2 mb-3">
                  {['Aneka', 'Rana', 'Jocelyn'].map((n) => (
                    <img key={n} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${n}`} alt={n} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100" />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">+</div>
                </div>
                <div className="text-xl font-bold text-[#4F46E5]">2000+</div>
                <div className="text-xs text-slate-500 font-medium">Success Student</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <div className="bg-[#1E1B4B] text-white py-6 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center text-lg lg:text-2xl font-bold whitespace-nowrap">
            <span>20+ Mentors</span>
            <span className="text-indigo-400">+</span>
            <span>100+ Active Courses</span>
            <span className="text-indigo-400">+</span>
            <span>24 Hours Support</span>
            <span className="text-indigo-400">+</span>
            <span>Course Certificate</span>
          </div>
        </div>

        {/* Categories Section */}
        <section className="bg-[#4F46E5] pt-24 pb-0 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-16 relative z-10">
            <div className="flex-1 text-white space-y-12 pb-24">
              <div className="space-y-4">
                <span className="text-yellow-400 text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> CATEGORY
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Browse Our Categories <br/> To Find Exactly <span className="font-serif italic font-normal border-b-2 border-yellow-400">Courses</span>
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Tech & Programming', count: '20 Cohorts', active: true },
                  { title: 'Digital Marketing', count: '50 Cohorts' },
                  { title: 'UI/UX Design', count: '12 Cohorts' },
                  { title: 'CyberSecurity', count: '30 Cohorts' }
                ].map((cat, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-6 rounded-2xl cursor-pointer transition-colors ${cat.active ? 'bg-white/10' : 'hover:bg-white/5 border border-white/10'}`}>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{cat.title}</h3>
                      {/* <p className="text-indigo-300 text-sm font-medium">{cat.count}</p> */}
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 relative min-h-[500px] lg:mt-12 rounded-tl-[4rem] rounded-tr-[4rem] bg-indigo-200 overflow-hidden flex items-end">
               <Image 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" 
                alt="Student smiling" 
                fill 
                className="object-cover object-center"
              />
            </div>

             {/* Floating text right */}
            {/* <div className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-12 text-white/50 font-bold text-2xl" style={{ writingMode: 'vertical-rl' }}>
              <span className="rotate-180 flex items-center gap-2"><div className="w-6 h-6 bg-white/50 rounded-full"></div> DexterHub</span>
              <span className="rotate-180">innovation</span>
              <span className="rotate-180">growth</span>
              <span className="rotate-180">success</span>
            </div> */}
          </div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" style={{ backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)' }}></div>
        </section>

        {/* About Us Section */}
        <section className="py-24 relative bg-white">
          <div className="absolute right-0 top-1/4 w-64 h-64 bg-[radial-gradient(circle,bg-indigo-600_2px,transparent_2px)]" style={{ backgroundSize: '16px 16px', backgroundImage: 'radial-gradient(circle, #e0e7ff 2px, transparent 2px)' }}></div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Images */}
            <div className="relative h-[600px]">
              <div className="absolute left-0 top-0 w-2/3 h-2/3 rounded-3xl overflow-hidden shadow-2xl z-10">
                 <Image 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" 
                  alt="Student studying" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 rounded-3xl overflow-hidden shadow-2xl z-20 border-8 border-white">
                <Image 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop" 
                  alt="Teacher smiling" 
                  fill 
                  className="object-cover"
                />
              </div>
              
              {/* Badges */}
              {/* <Card className="absolute top-12 -right-8 z-30 p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-inner p-1">
                   <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                     <span className="text-xl px-1">🎓</span>
                   </div>
                </div>
                <div>
                  <div className="font-bold text-xl text-slate-900">25+ <span className="text-sm font-medium text-slate-500">Years</span></div>
                  <div className="text-xs text-slate-500 font-medium whitespace-nowrap">of experience</div>
                </div>
              </Card> */}

              {/* <Card className="absolute bottom-12 left-8 z-30 p-6 rounded-2xl shadow-xl border-none">
                <div className="text-4xl font-bold text-slate-900 mb-1">45+</div>
                <div className="text-xs text-orange-500 font-bold uppercase tracking-wider">Awards Winning</div>
              </Card> */}

              <svg className="absolute top-1/2 left-1/2 z-30 w-32 h-32 text-indigo-100 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 90 Q 30 10 90 30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8"/>
                <path d="M70 20 L 95 25 L 90 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

            </div>

            {/* Right: Text Content */}
            <div className="space-y-8 z-10 relative">
              <div className="space-y-4">
                <span className="text-indigo-600 text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> ABOUT US
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
                  Our Story: Bridging the Gap <br/> Between Learning and <span className="font-serif italic font-normal text-indigo-500 border-b-2 border-indigo-200">Industry Excellence</span>
                </h2>
              </div>
              
              <p className="text-slate-500 leading-relaxed max-w-lg">
                DexterHub is more than an e-learning platform; it's a launchpad for the next generation of tech leaders. We combine cutting-edge curriculum with project-based learning to ensure our students don't just learn—they master the skills that drive the global digital economy.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xl">
                      🎯
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">Our Mission</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    To democratize high-impact tech education by providing accessible, expert-led training that transforms ambitious learners into industry-ready professionals.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl">
                      👁️
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">Our Vision</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    To be the primary catalyst for digital empowerment, building a future where technical mastery is within reach for everyone, everywhere.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                 <Button className="rounded-full px-8 h-12 bg-[#818cf8] hover:bg-[#6366f1] text-white font-semibold">
                  Know More
                </Button>
              </div>
            </div>

          </div>
        </section>

        {/* Courses Section */}
        
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="absolute left-0 bottom-0 w-full h-[500px] bg-white rounded-tr-[100px] z-0"></div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center space-y-4 mb-16">
               <span className="text-indigo-600 text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> OUR COURSES
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
                  More Than Just A Brand: <br/> A Journey Of <span className="font-serif italic font-normal text-indigo-500 border-b-2 border-indigo-200">Excellence</span>
                </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: 1,
                  name: "Software Development",
                  title: "Comprehensive Full-Stack Development",
                  icon: <Code className="w-12 h-12 text-indigo-600" />,
                  color: "bg-indigo-50"
                },
                {
                  id: 2,
                  name: "Cyber Security",
                  title: "Advanced Network Security & Ethical Hacking",
                  icon: <ShieldCheck className="w-12 h-12 text-red-600" />,
                  color: "bg-red-50"
                },
                {
                  id: 3,
                  name: "Digital Marketing",
                  title: "Digital Marketing Strategy & Growth",
                  icon: <Megaphone className="w-12 h-12 text-orange-600" />,
                  color: "bg-orange-50"
                }
              ].map((course) => (
                <Card key={course.id} className="rounded-[2rem] overflow-hidden border border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer h-full">
                  <div className={cn("h-56 relative m-4 rounded-[1.5rem] overflow-hidden flex items-center justify-center transition-transform group-hover:scale-[1.02]", course.color)}>
                     {course.icon}
                  </div>
                  <div className="p-6 pt-2 pb-8 space-y-4 flex flex-col items-center text-center">
                    <span className="text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{course.name}</span>
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                      {course.title}
                    </h3>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="flex flex-col items-center justify-center mt-16 space-y-6 pb-12">
               <Button className="rounded-full px-12 h-14 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-100 transition-all hover:scale-105">
                 Explore All Courses <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
               <div className="flex gap-2">
                 <button className="w-3 h-3 rounded-full bg-orange-500"></button>
                 <button className="w-3 h-3 rounded-full bg-indigo-200"></button>
                 <button className="w-3 h-3 rounded-full bg-indigo-200"></button>
               </div>
            </div>
          </div>
        </section>
        {/* Testimonials Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center space-y-4 mb-16">
              <span className="text-indigo-600 text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> TESTIMONIALS
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
                Success Stories From <br/> Our <span className="font-serif italic font-normal text-indigo-500 border-b-2 border-indigo-200">Global Alumni</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Software Engineer at Google",
                  image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                  quote: "DexterHub transformed my career. The project-based learning in the Software Development cohort was exactly what I needed to land my dream job."
                },
                {
                  name: "David Chen",
                  role: "Security Analyst",
                  image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
                  quote: "The Cyber Security training is world-class. I went from knowing nothing to being able to identify and mitigate complex network threats."
                },
                {
                  name: "Elena Rodriguez",
                  role: "Digital Marketing Lead",
                  image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
                  quote: "The mentorship at DexterHub is unparalleled. They don't just teach you the tools; they teach you how to think like a digital strategist."
                }
              ].map((testimonial, idx) => (
                <Card key={idx} className="p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 relative group">
                  <Quote className="absolute top-6 right-8 w-12 h-12 text-indigo-100 group-hover:text-indigo-200 transition-colors" />
                  <div className="space-y-6 relative z-10">
                    <p className="text-slate-600 leading-relaxed italic text-lg">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-md border-2 border-white">
                        <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                        <p className="text-sm text-indigo-600 font-medium">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-0" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -z-0" />

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Column: Info */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="text-indigo-400 text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span> CONTACT US
                  </span>
                  <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                    Let's Build Your <br/> <span className="text-indigo-400">Digital Future</span> Together
                  </h2>
                  <p className="text-slate-400 max-w-md leading-relaxed">
                    Have questions about our cohorts? Want to partner with us? Reach out and our team will get back to you within 24 hours.
                  </p>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Email Us</p>
                      <p className="font-bold text-lg">hello@dexterhub.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Call Us</p>
                      <p className="font-bold text-lg">+1 (234) 567 890</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Our Campus</p>
                      <p className="font-bold text-lg">Nigeria</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  {[Twitter, Linkedin, Github].map((Icon, i) => (
                    <button key={i} className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center hover:bg-indigo-500 hover:border-indigo-500 transition-all text-slate-400 hover:text-white">
                      <Icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Form */}
              <Card className="p-8 lg:p-10 rounded-[2.5rem] bg-white text-slate-900 shadow-2xl overflow-hidden relative">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com" 
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900 ml-1">Subject</label>
                    <input 
                      type="text" 
                      placeholder="I'm interested in the Software Development cohort" 
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900 ml-1">Message</label>
                    <textarea 
                      placeholder="Tell us a bit about your goals..." 
                      rows={4}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none" 
                    />
                  </div>
                  <Button className="w-full rounded-2xl h-14 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                    Send Message <Send className="w-5 h-5" />
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center text-white">
                <span className="font-bold -mb-1 ml-0.5 text-lg">D</span>
              </div>
              <div className="text-xl font-bold tracking-tight text-slate-900">DexterHub</div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-slate-500">
              <Link href="#" className="hover:text-[#4F46E5]">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#4F46E5]">Terms of Service</Link>
              <Link href="#" className="hover:text-[#4F46E5]">Security Setup</Link>
            </div>

            <p className="text-sm font-medium text-slate-400">© 2026 DexterHub Technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
