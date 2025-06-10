import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2 text-primary-700">
              <Leaf className="h-6 w-6" />
              <span className="text-xl font-semibold">FoodShare</span>
            </Link>
            <p className="mb-6 text-neutral-600">
              Reducing food waste while helping communities thrive. Together we can make a difference.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-colors hover:bg-primary-200"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-colors hover:bg-primary-200"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-colors hover:bg-primary-200"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-neutral-900">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-neutral-600 transition-colors hover:text-primary-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-neutral-600 transition-colors hover:text-primary-600">
                  Browse Donations
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-neutral-600 transition-colors hover:text-primary-600">
                  Donate Food
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-neutral-600 transition-colors hover:text-primary-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-neutral-600 transition-colors hover:text-primary-600">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-neutral-900">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-neutral-600 transition-colors hover:text-primary-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-neutral-600 transition-colors hover:text-primary-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="text-neutral-600 transition-colors hover:text-primary-600">
                  Food Safety Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-neutral-900">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-primary-600" />
                <span className="text-neutral-600">
                  123 Green Street, Eco City, EC 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 h-5 w-5 text-primary-600" />
                <a href="tel:+1234567890" className="text-neutral-600 transition-colors hover:text-primary-600">
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-3 h-5 w-5 text-primary-600" />
                <a href="mailto:hello@foodshare.org" className="text-neutral-600 transition-colors hover:text-primary-600">
                  hello@foodshare.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-neutral-200" />

        {/* Bottom Footer */}
        <div className="flex flex-col justify-between gap-4 text-sm text-neutral-500 md:flex-row md:items-center">
          <p>© {currentYear} FoodShare. All rights reserved.</p>
          <p>
            Made with ♥ for a better planet
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;