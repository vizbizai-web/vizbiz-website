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
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="section-shell section-transition section-divider bg-[#081220] py-16 sm:py-20 lg:py-28" style={{ ["--transition-from" as string]: "#0d1f3a" }}>
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <h2 className="text-[2.2rem] font-bold tracking-[-0.02em] text-white sm:text-[2.6rem] lg:text-[3rem]">
            Get Your Free AVI Score Assessment
          </h2>
          <p className="mt-5 text-[1.08rem] leading-8 text-white/68 sm:text-lg">
            See exactly where you stand. No commitment. No obligation. Just clarity.
          </p>
          <p className="mt-3 font-medium text-cyan-200">
            30 minutes. We&apos;ll show you your score and your competitors&apos;.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="glass-card rounded-[1.8rem] p-5 sm:p-6 lg:p-8">
            <h3 className="text-xl font-bold text-white">Send us a message</h3>

            {isSubmitted ? (
              <div className="py-10 text-center sm:py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                  <CheckCircle className="h-8 w-8 text-emerald-300" />
                </div>
                <h4 className="text-xl font-bold text-white">Thank You!</h4>
                <p className="mt-2 text-white/64">
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
                className="mt-6 space-y-5 sm:space-y-6"
              >
                <input type="hidden" name="form-name" value="contact" />
                <div hidden>
                  <input name="bot-field" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-white/74">
                      Full Name *
                    </label>
                    <input type="text" id="name" name="name" required value={formState.name} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-white outline-none transition-all placeholder:text-white/30 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/12" placeholder="John Smith" />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/74">
                      Email Address *
                    </label>
                    <input type="email" id="email" name="email" required value={formState.email} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-white outline-none transition-all placeholder:text-white/30 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/12" placeholder="john@dealership.com" />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                  <div>
                    <label htmlFor="dealership" className="mb-2 block text-sm font-medium text-white/74">
                      Dealership Name *
                    </label>
                    <input type="text" id="dealership" name="dealership" required value={formState.dealership} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-white outline-none transition-all placeholder:text-white/30 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/12" placeholder="Oakville Honda" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-white/74">
                      Phone Number
                    </label>
                    <input type="tel" id="phone" name="phone" value={formState.phone} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-white outline-none transition-all placeholder:text-white/30 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/12" placeholder="(905) 555-0123" />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-white/74">
                    Message (Optional)
                  </label>
                  <textarea id="message" name="message" rows={4} value={formState.message} onChange={handleChange} className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-white outline-none transition-all placeholder:text-white/30 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/12" placeholder="Tell us about your dealership and any specific concerns..." />
                </div>

                <button type="submit" className="premium-button inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-bold text-white">
                  <Send className="h-5 w-5" />
                  Request Free Assessment
                </button>

                <p className="text-center text-xs text-white/46">
                  We respect your privacy. Your information will never be shared.
                </p>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.8rem] border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(15,111,255,0.78)_0%,rgba(6,182,212,0.34)_100%)] p-6 text-white shadow-[0_24px_70px_rgba(6,78,180,0.24)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/14">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Book a Time That Works for You</h3>
              <p className="mt-3 text-blue-50/88">
                Schedule your free 30-minute assessment directly on our calendar.
                No back-and-forth emails. Pick a time and we&apos;ll call you.
              </p>
              <a href="https://calendly.com/vizbiz-ai/15min" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/16">
                <Calendar className="h-5 w-5" />
                Schedule on Calendly
              </a>
            </div>

            <div className="glass-card rounded-[1.8rem] p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white">Other Ways to Reach Us</h3>

              <div className="mt-6 space-y-4">
                <a href="mailto:hello@vizbiz.ai" className="glass-card flex items-center gap-4 rounded-xl p-4 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-cyan-200">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Email Us</p>
                    <p className="text-sm text-white/60">hello@vizbiz.ai</p>
                  </div>
                </a>

                <a href="tel:+19055550123" className="glass-card flex items-center gap-4 rounded-xl p-4 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-cyan-200">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Call Us</p>
                    <p className="text-sm text-white/60">(905) 555-0123</p>
                  </div>
                </a>

                <div className="glass-card flex items-center gap-4 rounded-xl p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-cyan-200">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Service Area</p>
                    <p className="text-sm text-white/60">Oakville, Mississauga, Burlington & Hamilton</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-[1.4rem] border border-emerald-400/18 bg-emerald-400/10 p-5 sm:p-6">
              <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-300" />
              <div>
                <p className="font-semibold text-white">We respond within 24 hours</p>
                <p className="mt-1 text-sm text-white/64">
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
