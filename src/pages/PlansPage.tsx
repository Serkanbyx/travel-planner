import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Map, Search, Upload } from 'lucide-react';
import { useTravelStore } from '@/store/useTravelStore';
import { PlanFormData, TravelPlan } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { PlanCard } from '@/components/plans/PlanCard';
import { CreatePlanDialog } from '@/components/plans/CreatePlanDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/useToast';

/**
 * Minimal runtime validation for an imported plan JSON file.
 */
function isValidPlan(value: unknown): value is TravelPlan {
  if (typeof value !== 'object' || value === null) return false;
  const plan = value as Partial<TravelPlan>;
  return (
    typeof plan.city === 'string' &&
    typeof plan.country === 'string' &&
    typeof plan.startDate === 'string' &&
    typeof plan.endDate === 'string' &&
    Array.isArray(plan.days)
  );
}

/**
 * Page displaying all travel plans
 */
export function PlansPage() {
  const navigate = useNavigate();
  const { plans, addPlan, deletePlan, importPlan } = useTravelStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePlan = (data: PlanFormData) => {
    const planId = addPlan(data);
    toast({
      title: 'Plan created!',
      description: `Your trip to ${data.city} has been created.`,
    });
    navigate(`/plan/${planId}`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidPlan(parsed)) {
        throw new Error('Invalid plan format');
      }
      const planId = importPlan(parsed);
      toast({
        title: 'Plan imported',
        description: `Your trip to ${parsed.city} has been imported.`,
      });
      navigate(`/plan/${planId}`);
    } catch (error) {
      console.error('Failed to import plan:', error);
      toast({
        title: 'Import failed',
        description: 'The selected file is not a valid travel plan JSON.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePlan = (id: string) => {
    const plan = plans.find((p) => p.id === id);
    deletePlan(id);
    toast({
      title: 'Plan deleted',
      description: plan ? `${plan.city} trip has been removed.` : 'Plan removed.',
    });
  };

  // Filter plans by search query
  const filteredPlans = plans.filter(
    (plan) =>
      plan.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout onCreatePlan={() => setCreateDialogOpen(true)}>
      <div className="container py-8">
        {/* Hero Section */}
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 p-6 rounded-full bg-primary/10">
              <Map className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Plan Your Perfect Trip
            </h1>
            <p className="text-xl text-muted-foreground max-w-md mb-8">
              Create detailed travel itineraries, organize daily activities, and export your plans.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button size="lg" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Plan
              </Button>
              <Button size="lg" variant="outline" onClick={handleImportClick}>
                <Upload className="h-5 w-5 mr-2" />
                Import from JSON
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Travel Plans</h1>
                <p className="text-muted-foreground mt-1">
                  {plans.length} {plans.length === 1 ? 'plan' : 'plans'} created
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={handleImportClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>

            {/* Plans Grid */}
            {filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No plans found matching "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onDelete={handleDeletePlan}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Create Plan Dialog */}
      <CreatePlanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreatePlan}
      />
    </Layout>
  );
}
