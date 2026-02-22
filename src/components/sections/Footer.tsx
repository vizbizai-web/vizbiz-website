"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: "AVI Audit", href: "#pricing" },
      { label: "Implementation", href: "#pricing" },
      { label: "Monthly Monitoring", href: "#pricing" },
      { label: "Full Management", href: "#pricing" },
    ],
    company: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "What You Get", href: "#what-you-get" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-bold text-2xl text-white">VizBiz.ai</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              AI Visibility Intelligence for car dealerships. We help you become 
              the answer AI systems recommend.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:hello@vizbiz.ai" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
                hello@vizbiz.ai
              </a>
              <a href="tel:+19055550123" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
                (905) 555-0123
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Serving Oakville, Mississauga,<br />Burlington & Hamilton</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            {currentYear} VizBiz.ai. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Serving car dealerships in the Greater Toronto Area
          </p>
        </div>
      </div>
    </footer>
  );
}
