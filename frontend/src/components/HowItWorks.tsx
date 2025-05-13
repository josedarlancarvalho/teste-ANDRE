import React from "react";
import { User, Users, Briefcase } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: User,
      title: "Para Jovens",
      description: "Crie seu perfil, envie vídeo e apresente projetos para avaliação.",
      color: "bg-si-accent"
    },
    {
      icon: Users,
      title: "Para RH",
      description: "Avalie com medalhas e forneça feedback construtivo aos jovens talentos.",
      color: "bg-si-blue"
    },
    {
      icon: Briefcase,
      title: "Para Gestores",
      description: "Acesse talentos de forma prática e socialmente responsável.",
      color: "bg-gray-700"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-si-light">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-si-blue mb-4">Como Funciona</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A plataforma SimplyInvite conecta três perfis em um processo simples e eficiente.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto`}>
                <step.icon className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-si-blue mb-4 text-center">{step.title}</h3>
              <p className="text-gray-600 text-center">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
