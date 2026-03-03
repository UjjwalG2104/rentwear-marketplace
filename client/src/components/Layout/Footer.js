import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ShoppingBag,
  Heart,
  Shield,
  Truck
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Safety Center', href: '#' },
      { name: 'Community Guidelines', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Privacy Policy', href: '#' },
    ],
    renters: [
      { name: 'How it Works', href: '#' },
      { name: 'Browse Items', href: '/clothing' },
      { name: 'Rental Insurance', href: '#' },
      { name: 'Return Policy', href: '#' },
    ],
    owners: [
      { name: 'List Your Items', href: '/create-listing' },
      { name: 'Owner Protection', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Success Stories', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="w-8 h-8 text-primary-400" />
              <span className="text-2xl font-bold">RentWear</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              The premier marketplace for renting high-quality clothing. 
              Sustainable fashion made accessible to everyone.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary-400" />
                <span className="text-sm text-gray-300">Insured Rentals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-primary-400" />
                <span className="text-sm text-gray-300">Free Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-primary-400" />
                <span className="text-sm text-gray-300">Curated Items</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-primary-400" />
                <span className="text-sm text-gray-300">Premium Quality</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-primary-900 transition-colors duration-200"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map(({ name, href }) => (
                <li key={name}>
                  <Link
                    to={href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map(({ name, href }) => (
                <li key={name}>
                  <Link
                    to={href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Renters Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Renters</h3>
            <ul className="space-y-2">
              {footerLinks.renters.map(({ name, href }) => (
                <li key={name}>
                  <Link
                    to={href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-gray-300">support@rentwear.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-gray-300">1-800-RENT-WEAR</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-400">Address</p>
                <p className="text-gray-300">123 Fashion Ave, NY 10001</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for exclusive deals and fashion tips
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-400 text-white"
              />
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} RentWear. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
