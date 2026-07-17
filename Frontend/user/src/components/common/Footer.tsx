import { Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_ADDRESS, COPYRIGHT_YEAR } from '@/config/site';

const Footer = () => {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold text-foreground">{SITE_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your premier destination for discovering and booking amazing events.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/events" className="hover:text-primary transition-colors">Browse Events</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">For Organizers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> {SUPPORT_EMAIL}</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> {SUPPORT_PHONE}</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {SUPPORT_ADDRESS}</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {COPYRIGHT_YEAR} {SITE_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
