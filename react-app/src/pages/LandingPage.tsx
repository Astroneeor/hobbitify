import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Navigation */}
      <nav className="border-b border-border-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-semibold">hobbitify</div>
          <Link 
            to="/getting-started" 
            className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-all duration-200 font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-text-primary via-accent-light to-accent-primary bg-clip-text text-transparent">
          Turn any skill into an interactive learning journey
        </h1>
        
        <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
          Transform your learning goals into RPG-style skill trees. AI-powered. 
          Visual. Engaging. Start your quest today.
        </p>

        {/* Interactive Demo */}
        <div className="bg-bg-tertiary rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
          <div className="text-text-secondary mb-4 text-sm uppercase tracking-wide font-medium">
            I want to learn how to
          </div>
          
          <div className="relative h-16 overflow-hidden rounded-lg border border-border-secondary bg-bg-secondary">
            <div className="absolute inset-0 flex items-center justify-center animate-scroll">
              <div className="flex flex-col items-center space-y-4">
                {[
                  "master woodworking",
                  "play dungeons & dragons", 
                  "knit a cozy sweater",
                  "spin a pen like a pro",
                  "carve beautiful soapstone",
                  "dominate at geoguesser",
                  "collect rare insects",
                  "create pyrography art",
                  "craft handmade journals"
                ].map((skill, index) => (
                  <div key={index} className="h-16 flex items-center text-lg font-medium whitespace-nowrap">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-text-muted text-sm">
            ✨ Each skill becomes a visual, step-by-step learning path
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/getting-started" 
            className="px-8 py-4 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-accent-primary/25"
          >
            Start Building Your Skill Tree
          </Link>
          
          <button className="px-8 py-4 border border-border-secondary hover:border-border-primary text-text-secondary hover:text-text-primary rounded-xl font-medium text-lg transition-all duration-200">
            See Example Trees
          </button>
        </div>

        {/* Feature Preview */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-bg-tertiary rounded-xl p-6 border border-border-primary hover:border-border-secondary transition-colors duration-200">
            <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-text-secondary text-sm">
              Claude AI analyzes your goals and creates personalized learning pathways with the optimal skill progression.
            </p>
          </div>

          <div className="bg-bg-tertiary rounded-xl p-6 border border-border-primary hover:border-border-secondary transition-colors duration-200">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Visual Progress</h3>
            <p className="text-text-secondary text-sm">
              See your learning journey as an interactive skill tree. Track progress and unlock new abilities as you advance.
            </p>
          </div>

          <div className="bg-bg-tertiary rounded-xl p-6 border border-border-primary hover:border-border-secondary transition-colors duration-200">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Structured Learning</h3>
            <p className="text-text-secondary text-sm">
              Break complex skills into manageable steps. Each node contains specific actions and completion criteria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
