import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Este componente só deve ser usado em ambiente de desenvolvimento
const DevModeLogin = () => {
  const { toast } = useToast();
  const { login, loading, error } = useAuth();
  
  const handleDevLogin = async (email: string, profileType: 'talent' | 'hr' | 'manager') => {
    // Alertar claramente que isso é apenas para desenvolvimento
    toast({
      title: "Modo de desenvolvimento",
      description: "Login rápido para desenvolvimento. Use credenciais reais em produção.",
      duration: 3000
    });

    try {
      // Tenta fazer login com credenciais de teste (senha fixa 'senha123')
      await login(email, 'senha123', profileType);
      
      // Sucesso implícito se não houver erro no contexto após a chamada
      // O AuthContext lidará com a navegação ou atualização do estado do usuário

    } catch (err) {
      // O erro já é tratado e armazenado no AuthContext
      // Apenas mostramos um toast adicional se desejado
      console.error("Dev Login Error Catch:", err); 
    }

    // Verificar o estado de erro do AuthContext *depois* da tentativa de login
    // Usar um pequeno timeout para permitir que o estado do AuthContext atualize
    setTimeout(() => {
      if (error && !loading) { 
        toast({
          variant: "destructive",
          title: "Erro no login de desenvolvimento",
          description: error || "Verifique o console ou o backend para mais detalhes.",
        });
      }
    }, 100); // Pequeno delay
  };

  return (
    <Card className="w-full max-w-md mb-8 border-orange-300 bg-orange-50">
      <CardHeader className="bg-orange-100 border-b border-orange-200">
        <CardTitle className="text-orange-800">⚠️ Modo de Desenvolvimento</CardTitle>
        <CardDescription className="text-orange-700">
          Autenticação simulada para testes. NÃO use em produção!
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="text-sm text-orange-700 mb-4">
          Selecione um perfil para login rápido de teste:
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            className="border-orange-300 hover:bg-orange-100"
            onClick={() => handleDevLogin('jovem@example.com', 'talent')}
          >
            Jovem
          </Button>
          <Button 
            variant="outline"
            className="border-orange-300 hover:bg-orange-100"
            onClick={() => handleDevLogin('rh@example.com', 'hr')}
          >
            RH
          </Button>
          <Button 
            variant="outline"
            className="border-orange-300 hover:bg-orange-100"
            onClick={() => handleDevLogin('gestor@example.com', 'manager')}
          >
            Gestor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevModeLogin;
