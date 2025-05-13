import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth, AuthContextType } from "@/contexts/AuthContext";
import { ProfileType } from "../../../../backend/src/types"; // Importar do backend
import { useToast } from "@/components/ui/use-toast";
import { DialogProps } from "@radix-ui/react-dialog"; // Import if needed for onClose typing

// Tipos para os diferentes perfis de usuário
type CommonFields = {
  fullName: string;
  email: string;
  password: string;
};

type TalentFields = CommonFields & {
  interestArea: string;
  portfolioLink: string;
};

type HRFields = CommonFields & {
  company: string;
  cnpj: string;
};

type ManagerFields = CommonFields & {
  company: string;
  position: string;
  talentSearchArea: string;
};

// Esquemas de validação
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

const registerCommonSchema = loginSchema.extend({
  fullName: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
});

const talentSchema = registerCommonSchema.extend({
  interestArea: z.string().min(2, { message: "Informe sua área de interesse" }),
  portfolioLink: z.string().optional(),
});

const hrSchema = registerCommonSchema.extend({
  company: z.string().min(2, { message: "Informe o nome da empresa" }),
  cnpj: z.string().min(14, { message: "CNPJ inválido" }),
});

const managerSchema = registerCommonSchema.extend({
  company: z.string().min(2, { message: "Informe o nome da empresa" }),
  position: z.string().min(2, { message: "Informe seu cargo" }),
  talentSearchArea: z.string().min(2, { message: "Informe a área de busca de talentos" }),
});

// Props for the internal form component
interface ActualFormProps {
  isRegistering: boolean;
  userType: ProfileType;
  onClose: () => void;
  auth: AuthContextType;
  toast: ReturnType<typeof useToast>['toast'];
}

// Internal component containing the actual form logic
const ActualForm: React.FC<ActualFormProps> = ({ 
  isRegistering, 
  userType, 
  onClose, 
  auth, 
  toast 
}) => {
  const { login, register, loading, error } = auth;

  const getSchema = () => {
    if (isRegistering) {
      switch (userType) {
        case "talent": return talentSchema;
        case "hr": return hrSchema;
        case "manager": return managerSchema;
        default: return registerCommonSchema; 
      }
    }
    return loginSchema;
  };
  
  const currentSchema = getSchema();
  
  // *** INÍCIO DA MUDANÇA DE TIPOS ***
  // Definir uma união de todos os schemas possíveis
  type AllFormSchemas = typeof talentSchema | typeof hrSchema | typeof managerSchema | typeof loginSchema;
  // Inferir o tipo de valores como uma união dos resultados de todos os schemas
  type FormValuesUnion = z.infer<AllFormSchemas>;
  // *** FIM DA MUDANÇA DE TIPOS ***

  const form = useForm<FormValuesUnion>({ // <<< Usar a união de tipos aqui
    resolver: zodResolver(currentSchema), // O resolver ainda usa o schema específico atual
    defaultValues: { // <<< Fornecer todos os campos possíveis da união
      email: "",
      password: "",
      fullName: "", 
      interestArea: "", 
      portfolioLink: "", 
      company: "", 
      cnpj: "", 
      position: "", 
      talentSearchArea: "",
    } as FormValuesUnion, // Afirmar o tipo aqui pode ser necessário
  });
  
  // onSubmit precisa lidar com FormValuesUnion, mas a lógica interna já faz isso
  const onSubmit = async (values: FormValuesUnion) => { 
    try {
      if (isRegistering) {
        let userData: any;
        // O casting baseado em userType ainda é necessário para acessar campos específicos
        if (userType === 'talent') {
          const talentValues = values as z.infer<typeof talentSchema>; // Cast para tipo específico
          userData = { fullName: talentValues.fullName, interestArea: talentValues.interestArea, portfolioLink: talentValues.portfolioLink };
        } else if (userType === 'hr') {
          const hrValues = values as z.infer<typeof hrSchema>; // Cast para tipo específico
          userData = { fullName: hrValues.fullName, company: hrValues.company, cnpj: hrValues.cnpj };
        } else { // manager
          const managerValues = values as z.infer<typeof managerSchema>; // Cast para tipo específico
          userData = { fullName: managerValues.fullName, company: managerValues.company, position: managerValues.position, talentSearchArea: managerValues.talentSearchArea };
        }
        // Passar o email/password que são comuns a todos os tipos em values
        await register(values.email!, values.password!, userType, userData); 
        toast({ title: "Cadastro realizado com sucesso!" });
      } else {
        // Para login, email e password estão garantidos na união
        await login(values.email!, values.password!, userType); 
        toast({ title: "Login realizado com sucesso!" });
      }
      onClose();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error || "Ocorreu um erro.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Campos comuns para todos os tipos de usuário */}
        {isRegistering && (
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seu.email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos específicos para cada tipo de usuário (apenas mostrados durante o registro) */}
        {isRegistering && userType === "talent" && (
          <>
            <FormField
              control={form.control}
              name="interestArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área de Interesse</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Design, Programação, Marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="portfolioLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de Portfólio/Vídeo</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link para seu portfólio, LinkedIn ou vídeo de apresentação
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {isRegistering && userType === "hr" && (
          <>
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="XX.XXX.XXX/XXXX-XX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {isRegistering && userType === "manager" && (
          <>
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu cargo na empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="talentSearchArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área de Busca de Talentos</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Design, Programação, Marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Carregando..." : isRegistering ? "Cadastrar" : "Entrar"}
          </Button>

          {/* Mostrar erro do contexto */} 
          {/* O erro do submit é tratado no catch e exibido via toast, mas pode-se mostrar aqui também se necessário */}
          {/* {error && !loading && <p className="text-red-500 text-sm mt-2">{error}</p>} */}

        </div>
      </form>
    </Form>
  );
};

// --- Main AuthForm component (wrapper) ---

// Adicionar a interface novamente aqui
interface AuthFormProps {
  userType: ProfileType;
  isOpen: boolean;
  onClose: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ userType, isOpen, onClose }) => {
  const [isRegistering, setIsRegistering] = React.useState(false);
  const auth = useAuth(); // Get the whole auth context
  const { toast } = useToast();

  // Título e descrição baseados no tipo de usuário
  const getTitleAndDescription = () => {
    switch (userType) {
      case "talent":
        return {
          title: "Área do Jovem Talento",
          description: isRegistering 
            ? "Crie sua conta para começar a mostrar seu talento."
            : "Entre para acompanhar seus projetos e feedbacks."
        };
      case "hr":
        return {
          title: "Área do Profissional de RH",
          description: isRegistering 
            ? "Crie sua conta para começar a avaliar projetos."
            : "Entre para avaliar e fornecer feedback aos jovens talentos."
        };
      case "manager":
        return {
          title: "Área do Gestor",
          description: isRegistering 
            ? "Crie sua conta para começar a buscar talentos."
            : "Entre para buscar novos talentos para sua empresa."
        };
    }
  };

  const { title, description } = getTitleAndDescription();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Render the internal form with a dynamic key */}
        <ActualForm 
          key={isRegistering ? 'register' : 'login'} 
          isRegistering={isRegistering} 
          userType={userType} 
          onClose={onClose} 
          auth={auth} 
          toast={toast} 
        />

        {/* Toggle button remains here */}
        <Button 
          type="button" 
          variant="outline" 
          className="w-full mt-4" // Added margin top for spacing
          onClick={() => setIsRegistering(!isRegistering)}
          disabled={auth.loading} // Disable while loading
        >
          {isRegistering ? "Já tenho uma conta" : "Criar uma conta"}
        </Button>

        {/* Optional: Display general auth error here if needed */}
        {auth.error && !auth.loading && (
          <p className="text-red-500 text-sm mt-2 text-center">{auth.error}</p>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default AuthForm;
