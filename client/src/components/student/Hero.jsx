import React from "react";
import { assets } from "../../assets/assets";
import SearchBar from "./SearchBar";
const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-24 pt-14 pb-16 px-6 md:px-0 space-y-7 text-center bg-gradient-to-b from-blue-100/60 via-slate-100/40 to-slate-50 border-b border-slate-200/80 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-400/10 to-indigo-400/5 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Humanized Clean Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
        Smart Learning & Interactive Courses
      </div>

      <h1 className="md:text-5xl text-3xl font-extrabold text-slate-900 max-w-4xl mx-auto leading-tight tracking-tight">
        Empower your future with courses designed to{" "}
        <span className="text-blue-600 relative inline-block">
          fit your choices.
        </span>
        <img
          src={assets.sketch}
          alt="sketch"
          className="md:block hidden absolute -bottom-6 right-10 w-36 opacity-75"
        />
      </h1>

      <p className="md:block hidden text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed font-normal">
        We bring together world-class instructors, interactive course content, and flexible learning schedules to help you achieve your professional goals.
      </p>

      <p className="md:hidden text-slate-600 max-w-sm mx-auto text-sm leading-relaxed">
        World-class instructors and interactive course content to help you achieve your goals.
      </p>
      
      <SearchBar />

      {/* Feature Highlights */}
      <div className="pt-2 flex flex-wrap justify-center items-center gap-6 text-xs md:text-sm text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="text-blue-600 font-bold">✓</span> 10,000+ Enrolled Students
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-blue-600 font-bold">✓</span> Expert-Led Video Content
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-blue-600 font-bold">✓</span> Lifetime Course Access
        </span>
      </div>
    </div>
  );
};

export default Hero;
