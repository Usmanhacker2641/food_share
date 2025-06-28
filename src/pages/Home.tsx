import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Apple, ShoppingBag, Truck, Heart, Users, Globe, Sparkles, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const stats = [
    { icon: Users, label: 'Active Users', value: '10,000+', color: 'text-primary-600' },
    { icon: Apple, label: 'Meals Shared', value: '50,000+', color: 'text-secondary-600' },
    { icon: Globe, label: 'Cities Served', value: '25+', color: 'text-accent-600' },
    { icon: Heart, label: 'Lives Impacted', value: '100,000+', color: 'text-pink-600' },
  ];

  const features = [
    {
      icon: Apple,
      title: 'Donate Surplus Food',
      description: 'List your surplus food items for donation. Help reduce waste and feed those in need.',
      color: 'from-primary-400 to-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      icon: ShoppingBag,
      title: 'Request Donations',
      description: 'Browse available donations and request items for your community or organization.',
      color: 'from-secondary-400 to-secondary-600',
      bgColor: 'bg-gradient-to-br from-secondary-50 to-secondary-100',
      iconColor: 'text-secondary-600',
    },
    {
      icon: Truck,
      title: 'Volunteer to Deliver',
      description: 'Join our network of volunteer riders to help collect and deliver food donations.',
      color: 'from-accent-400 to-accent-600',
      bgColor: 'bg-gradient-to-br from-accent-50 to-accent-100',
      iconColor: 'text-accent-600',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Community Volunteer',
      content: 'FoodShare has transformed how our community handles food waste. Amazing platform!',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      role: 'Restaurant Owner',
      content: 'We\'ve donated over 1000 meals through FoodShare. It feels great to give back!',
      avatar: 'https://i.pravatar.cc/150?img=2',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Food Bank Director',
      content: 'The efficiency and ease of use makes FoodShare our go-to platform for donations.',
      avatar: 'https://i.pravatar.cc/150?img=3',
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4 pt-20">
        <div className="absolute inset-0 bg-hero-pattern opacity-30"></div>
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh]">
            <motion.div 
              className="max-w-2xl lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">Join the Food Revolution</span>
              </div>
              
              <h1 className="mb-6 text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-600 bg-clip-text text-transparent">
                  Share Food,
                </span>
                <br />
                <span className="text-neutral-900">Save Lives</span>
              </h1>
              
              <p className="mb-8 text-xl text-neutral-600 leading-relaxed">
                Join our vibrant community in reducing food waste while helping those in need.
                Connect with local donors, recipients, and volunteer riders to make a real difference.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/donate"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-glow hover:scale-105"
                >
                  <Heart className="h-5 w-5 group-hover:animate-pulse" />
                  Start Donating
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/browse"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-primary-200 bg-white px-8 py-4 font-semibold text-primary-700 transition-all duration-300 hover:bg-primary-50 hover:border-primary-300 hover:shadow-lg"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Browse Donations
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                    <div className="text-sm text-neutral-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="lg:w-1/2 mt-12 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-3xl blur-3xl opacity-20 animate-pulse-slow"></div>
                <img
                  src="https://images.pexels.com/photos/6995247/pexels-photo-6995247.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Community sharing food"
                  className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-600">Impact Today</div>
                      <div className="text-lg font-bold text-neutral-900">+127 Meals</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-neutral-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">How It Works</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Simple Steps to Make a
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"> Difference</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our platform makes it easy to connect food donors with those in need, creating a sustainable cycle of giving.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`group relative overflow-hidden rounded-3xl ${feature.bgColor} p-8 transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative z-10">
                  <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-neutral-900">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 mb-4 shadow-lg">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium text-neutral-700">Community Love</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              What Our Community
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"> Says</span>
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                    <div className="text-sm text-neutral-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of people already making an impact in their communities.
              Every meal shared is a step towards a better world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 font-semibold text-primary-600 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <Users className="h-5 w-5" />
                Join Our Community
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/browse"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-white bg-transparent px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-white hover:text-primary-600"
              >
                <Globe className="h-5 w-5" />
                Explore Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;