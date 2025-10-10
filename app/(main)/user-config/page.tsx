"use client";

import React from 'react';

// Contexts
import { useAuth } from '../../../contexts/AuthContext';
import { useState } from 'react';

// UI
import { Button } from '@/components/ui/button';
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Camera, User } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const baseSchema = z.object({
    firstName: z.string()
        .min(3, "Nome deve ter pelo menos 3 caracteres.")
        .max(100, "Nome deve ter no máximo 100 caracteres.")
        .nonempty("Nome é obrigatório."),
    lastName: z.string()
        .min(3, "Sobrenome deve ter pelo menos 3 caracteres.")
        .max(100, "Sobrenome deve ter no máximo 100 caracteres.")
        .nonempty("Sobrenome é obrigatório."),
    username: z.string()
        .min(3, "Nome de usuário deve ter pelo menos 3 caracteres.")
        .max(50, "Nome de usuário deve ter no máximo 50 caracteres.")
        .nonempty("Nome de usuário é obrigatório."),
    email: z.string().email("Email inválido.").nonempty("Email é obrigatório."),
    password: z.string()
        .min(6, "Senha deve ter pelo menos 6 caracteres.")
        .max(100, "Senha deve ter no máximo 100 caracteres.")
        .optional(),
})

export default function Page() {
    const router = useRouter();
    
    type FormValues = z.infer<typeof baseSchema>;

    const form = useForm<FormValues>({
        mode: "onChange",
        reValidateMode: "onChange",
        resolver: zodResolver(baseSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            username: "",
            password: "",
        }
    })
    const { email, username, firstName, lastName, isAuthenticated } = useAuth();

    // Estados e funções para o diálogo de confirmação de logout
    const [cropOpen, setCropOpen] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        async function loadUserData() {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }
            setLoading(true);

            try {
                const userData = { email, username, firstName, lastName };

                if (userData) {
                    form.reset(userData);
                } else {
                    toast.error("Dados de usuário não encontrados.", { closeButton: true });
                    router.push("/")
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                toast.error("Erro ao carregar dados do usuário.", { closeButton: true });
                router.push("/")
            } finally {
                setLoading(false);
            }
        }
        loadUserData();
    }, [isAuthenticated, email, username, firstName, lastName]);

    // Estado para imagem de perfil (local)
    const [profilePicture, setProfilePicture] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("profileImage");
        }
        return null;
    });

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setTempImage(result);
                setCropOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            {/* Conteúdo principal das configurações */}
            <div className="bg-background min-h-screen">
                {!isAuthenticated ? (
                    <div className="flex items-center justify-center py-16 sm:py-24">
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <Spinner className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                            <span className="text-xs sm:text-sm text-muted-foreground">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Título da página */}
                        <div className="flex items-center gap-3 mb-6">
                            <Settings className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
                        </div>

                        {/* Seção de Perfil */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Perfil do Usuário
                                </CardTitle>
                                <CardDescription>
                                    Gerencie suas informações pessoais e foto de perfil
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        {profilePicture ? (
                                            <AvatarImage src={profilePicture} alt="Foto de perfil" />
                                        ) : (
                                            <AvatarFallback className="text-lg">
                                                {firstName && lastName
                                                    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
                                                    : username?.charAt(0)}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="font-medium">{firstName} {lastName}</h3>
                                        <p className="text-sm text-muted-foreground">@{username}</p>
                                        <p className="text-sm text-muted-foreground">{email}</p>
                                    </div>
                                    <label className="cursor-pointer">
                                        <Button variant="outline" size="sm" asChild>
                                            <span>
                                                <Camera className="h-4 w-4 mr-2" />
                                                Alterar Foto
                                            </span>
                                        </Button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seção de Informações da Conta */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Informações da conta
                                </CardTitle>
                                <CardDescription>
                                    Gerencie suas informações
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nome</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Digite seu nome" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sobrenome</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Digite seu sobrenome" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nome de usuário</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Digite seu nome de usuário" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Digite seu email" {...field} />
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
                                                        <Input type="password" placeholder="Digite sua nova senha" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>
                            </CardContent>
                            <CardFooter className='justify-end gap-2'>
                                <Button
                                    variant="default"
                                    size="sm"
                                >
                                    Salvar Alterações
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}