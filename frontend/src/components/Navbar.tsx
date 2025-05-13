import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import ProfileSelector from "@/components/auth/ProfileSelector";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { ProfileType } from "../../../backend/src/types";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserInitials = (email: string | undefined) => {
    return email ? email[0].toUpperCase() : "U";
  };

  const getDashboardPath = (profileType: ProfileType | undefined) => {
    switch (profileType) {
      case "talent": return "/jovem";
      case "hr": return "/rh";
      case "manager": return "/gestor";
      default: return "/";
    }
  };

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-si-blue font-sans font-bold text-2xl">
                SimplyInvite
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <a href="#how-it-works" className="text-si-blue hover:text-si-accent transition-colors">Como Funciona</a>
              <a href="#testimonials" className="text-si-blue hover:text-si-accent transition-colors">Depoimentos</a>
              <a href="#benefits" className="text-si-blue hover:text-si-accent transition-colors">Benefícios</a>
              
              {loading ? (
                <span className="text-sm text-gray-500">Carregando...</span>
              ) : user ? (
                <>
                  <Link to={getDashboardPath(user.profile_type)} className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials(user.email)}</AvatarFallback>
                    </Avatar>
                    <span className="text-si-blue hover:text-si-accent transition-colors">Meu Painel</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="text-si-blue hover:text-si-accent"
                    title="Sair"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Button 
                  className="bg-si-accent hover:bg-si-accent/90"
                  onClick={() => setIsProfileSelectorOpen(true)}
                >
                  Entrar
                </Button>
              )}
            </div>
            
            <button className="md:hidden text-si-blue">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Selector Modal */}
      <ProfileSelector 
        isOpen={isProfileSelectorOpen} 
        onOpenChange={setIsProfileSelectorOpen} 
      />
    </>
  );
};

export default Navbar;
