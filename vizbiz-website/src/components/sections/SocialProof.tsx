"use client";

import { Quote, TrendingUp, Users, Award } from "lucide-react";

export default function SocialProof() {
  const testimonials = [
    {
      quote: "We didn't even know this was a thing until Alex showed us our AVI Score. We were invisible in AI search. Three months later, we're #1 in our market. The ROI is ridiculous—our ChatGPT referrals alone paid for the service.",
      author: "General Manager",
      company: "Honda Dealership, Oakville",
      rating: 5,
    },
    {
      quote: "I was skeptical. Sounded like marketing fluff. But Alex showed us exactly where we were losing to Burlington Honda. We implemented the roadmap, and within 60 days we moved from #4 to #2. Now we're chasing #1.",
      author: "Owner",
      company: "Multi-location Dealership Group",
      rating: 5,
    },
  ];

  const stats = [
    { icon: Users, value: "23", label: "Dealerships audited" },
    { icon: TrendingUp, value: "+18", label: "Average AVI Score improvement" },
    { icon: Award, value: "100%", label: "See improvement within 60 days" },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Dealerships That Own the AI Answer
          </h2>
          <p className="text-lg text-gray-600">
            Real results from real dealerships in your market
          </p>
        </div>
        
        {/* Stats Banner */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <p className="text-gray-700 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-200 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Quote className="w-4 h-4 text-white" />
              </div>
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust Badges */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm mb-6">
            Trusted by dealerships across the Greater Toronto Area
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {["Oakville", "Mississauga", "Burlington", "Hamilton", "Toronto"].map((city) => (
              <div key={city} className="flex items-center gap-2 text-gray-400 font-medium">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
