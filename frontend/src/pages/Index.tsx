import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import InfoHeader from "@/components/InfoHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen">
      {import.meta.env.DEV && <InfoHeader />}
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <Testimonials />
      <Benefits />
      <Footer />
    </div>
  );
};

export default Index;
