"use client";

import { useState } from "react";
import { Send, Calendar, Phone, Mail, MapPin, CheckCircle } from "lucide-react";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    dealership: "",
    phone: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission is handled by Netlify
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Get Your Free AVI Score Assessment
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            See exactly where you stand. No commitment. No obligation. Just clarity.
          </p>
          <p className="text-blue-600 font-medium">
            30 minutes. We&apos;ll show you your score and your competitors&apos;.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h3>
            
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
                <p className="text-gray-600">
                  We&apos;ve received your message and will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form
                name="contact"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Netlify form requirements */}
                <input type="hidden" name="form-name" value="contact" />
                <div hidden>
                  <input name="bot-field" />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formState.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="john@dealership.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="dealership" className="block text-sm font-medium text-gray-700 mb-2">
                      Dealership Name *
                    </label>
                    <input
                      type="text"
                      id="dealership"
                      name="dealership"
                      required
                      value={formState.dealership}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Oakville Honda"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="(905) 555-0123"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formState.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="Tell us about your dealership and any specific concerns..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Request Free Assessment
                </button>

                <p className="text-xs text-gray-500 text-center">
                  We respect your privacy. Your information will never be shared.
                </p>
              </form>
            )}
          </div>

          {/* Alternative Contact Methods */}
          <div className="space-y-8">
            {/* Calendly CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Book a Time That Works for You</h3>
              <p className="text-blue-100 mb-6">
                Schedule your free 30-minute assessment directly on our calendar. 
                No back-and-forth emails. Pick a time and we&apos;ll call you.
              </p>
              <a
                href="https://calendly.com/vizbiz-ai/avi-assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Schedule on Calendly
              </a>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Other Ways to Reach Us</h3>
              
              <div className="space-y-4">
                <a
                  href="mailto:hello@vizbiz.ai"
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email Us</p>
                    <p className="text-sm text-gray-600">hello@vizbiz.ai</p>
                  </div>
                </a>

                <a
                  href="tel:+19055550123"
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Call Us</p>
                    <p className="text-sm text-gray-600">(905) 555-0123</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Service Area</p>
                    <p className="text-sm text-gray-600">Oakville, Mississauga, Burlington & Hamilton</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Response Promise */}
            <div className="flex items-start gap-4 p-6 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">We respond within 24 hours</p>
                <p className="text-sm text-green-700">
                  Usually much faster. We know you&apos;re busy running a dealership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
