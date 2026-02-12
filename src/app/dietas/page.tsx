'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Trash2, Edit } from 'lucide-react';

interface MealPlan {
  id: string;
  plan_name: string;
  description?: string;
  daily_calories: number;
  daily_protein_g: number;
  daily_fat_g: number;
  daily_carbs_g: number;
  created_by: string;
  created_at: string;
}

export default function DietasPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMealPlans();
    }
  }, [session]);

  const fetchMealPlans = async () => {
    try {
      const response = await fetch('/api/meal-plans', {
        headers: {
          'X-User-Id': session?.user?.id || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMealPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    router.push('/chat?prompt=' + encodeURIComponent('Crie uma dieta personalizada para mim'));
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      const response = await fetch(`/api/meal-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': session?.user?.id || '',
        },
      });

      if (response.ok) {
        fetchMealPlans();
      }
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  if (isPending || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-nutria-creme">
        <div className="text-nutria-bordo">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-nutria-creme">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-nutria-bordo mb-2">
                  Meus Planos Alimentares
                </h1>
                <p className="text-nutria-bordo/70">
                  Gerencie suas dietas e metas nutricionais
                </p>
              </div>
              <Button
                onClick={handleCreatePlan}
                className="bg-nutria-verde hover:bg-nutria-verde/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            </div>

            {/* Meal Plans Grid */}
            {mealPlans.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-nutria-bordo mb-2">
                  Nenhum plano criado ainda
                </h3>
                <p className="text-nutria-bordo/70 mb-6">
                  Crie seu primeiro plano alimentar com ajuda da IA
                </p>
                <Button
                  onClick={handleCreatePlan}
                  className="bg-nutria-verde hover:bg-nutria-verde/90 text-white"
                >
                  Criar Plano com IA
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mealPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-nutria-verde/20"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plan.created_by === 'ai'
                            ? 'bg-nutria-verde/20 text-nutria-verde'
                            : 'bg-nutria-bordo/20 text-nutria-bordo'
                        }`}
                      >
                        {plan.created_by === 'ai' ? '🤖 IA' : '👤 Manual'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(plan.id);
                        }}
                        className="text-nutria-vermelho hover:text-nutria-vermelho/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-lg font-semibold text-nutria-bordo mb-2">
                      {plan.plan_name}
                    </h3>

                    {/* Description */}
                    {plan.description && (
                      <p className="text-sm text-nutria-bordo/70 mb-4 line-clamp-2">
                        {plan.description}
                      </p>
                    )}

                    {/* Macros */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-nutria-bordo/70">Calorias</span>
                        <span className="font-medium text-nutria-bordo">
                          {plan.daily_calories} kcal
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-nutria-bordo/70">Proteína</span>
                        <span className="font-medium text-nutria-bordo">
                          {plan.daily_protein_g}g
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-nutria-bordo/70">Carbs</span>
                        <span className="font-medium text-nutria-bordo">
                          {plan.daily_carbs_g}g
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-nutria-bordo/70">Gordura</span>
                        <span className="font-medium text-nutria-bordo">
                          {plan.daily_fat_g}g
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-xs text-nutria-bordo/50 pt-4 border-t border-nutria-verde/20">
                      <Calendar className="w-3 h-3 mr-1" />
                      Criado em {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPlan && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedPlan(null)}
        >
          <Card
            className="max-w-2xl w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-nutria-bordo mb-4">
              {selectedPlan.plan_name}
            </h2>
            {selectedPlan.description && (
              <p className="text-nutria-bordo/70 mb-6">
                {selectedPlan.description}
              </p>
            )}

            {/* Detailed macros */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-nutria-verde/10 rounded-lg">
                <div className="text-2xl font-bold text-nutria-verde">
                  {selectedPlan.daily_calories}
                </div>
                <div className="text-sm text-nutria-bordo/70">kcal/dia</div>
              </div>
              <div className="p-4 bg-nutria-bordo/10 rounded-lg">
                <div className="text-2xl font-bold text-nutria-bordo">
                  {selectedPlan.daily_protein_g}g
                </div>
                <div className="text-sm text-nutria-bordo/70">Proteína</div>
              </div>
              <div className="p-4 bg-nutria-verde/10 rounded-lg">
                <div className="text-2xl font-bold text-nutria-verde">
                  {selectedPlan.daily_carbs_g}g
                </div>
                <div className="text-sm text-nutria-bordo/70">Carboidratos</div>
              </div>
              <div className="p-4 bg-nutria-bordo/10 rounded-lg">
                <div className="text-2xl font-bold text-nutria-bordo">
                  {selectedPlan.daily_fat_g}g
                </div>
                <div className="text-sm text-nutria-bordo/70">Gordura</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setSelectedPlan(null)}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  router.push(`/chat?prompt=${encodeURIComponent(`Edite o plano ${selectedPlan.plan_name}`)}`);
                }}
                className="flex-1 bg-nutria-verde hover:bg-nutria-verde/90 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar com IA
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
