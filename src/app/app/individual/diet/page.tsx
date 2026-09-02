'use client';

import React, { useState } from 'react';
import { TopNav } from '@/components/layout/top-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { getLocalTodayDateString } from '@/lib/date-utils';
import { DietLog } from '@/lib/types';
import {
  Utensils,
  Sparkles,
  Flame,
  CheckCircle2,
  Edit2,
  Scale,
  Zap,
} from 'lucide-react';

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', icon: '🍳', placeholder: 'e.g. 3 scrambled eggs, oatmeal with berries & almonds' },
  { id: 'lunch', name: 'Lunch', icon: '🥗', placeholder: 'e.g. Grilled chicken breast, brown rice, broccoli with olive oil' },
  { id: 'snacks', name: 'Snacks', icon: '🍎', placeholder: 'e.g. Greek yogurt with honey, protein shake, handful of walnuts' },
  { id: 'dinner', name: 'Dinner', icon: '🥩', placeholder: 'e.g. Salmon fillet, sweet potato, mixed greens with vinaigrette' },
] as const;

export default function DietTrackerPage() {
  const { profile } = useAuth();
  const todayStr = getLocalTodayDateString(profile?.timezone);

  // TDEE estimated from body weight (Mifflin-St Jeor / standard 33 kcal/kg active)
  const bodyWeight = profile?.body_weight_kg || 70;
  const tdeeTarget = Math.round(bodyWeight * 33);

  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('breakfast');
  const [itemsText, setItemsText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Override dialog
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [overrideCalorieInput, setOverrideCalorieInput] = useState('');

  // Real user meals (starts at 0)
  const [meals, setMeals] = useState<DietLog[]>([]);

  React.useEffect(() => {
    const storageKey = `wa_diet_${profile?.id || 'active'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMeals(JSON.parse(saved));
      } catch (e) {
        setMeals([]);
      }
    } else {
      setMeals([]);
    }
  }, [profile?.id]);

  const handleEstimateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemsText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/diet/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items_text: itemsText }),
      });
      const data = await res.json();

      const newLog: DietLog = {
        id: `d-${Date.now()}`,
        user_id: profile?.id || 'demo-warrior-001',
        log_date: todayStr,
        meal_type: activeMealType,
        items_text: itemsText,
        gemini_calories: data.calories,
        gemini_protein_g: data.protein_g,
        gemini_carbs_g: data.carbs_g,
        gemini_fat_g: data.fat_g,
        gemini_summary: data.one_line_summary,
        user_override_calories: null,
      };

      setMeals((prev) => {
        const updated = [newLog, ...prev];
        const storageKey = `wa_diet_${profile?.id || 'active'}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
      setItemsText('');
    } catch (err) {
      console.error('Failed to parse nutrition:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveOverride = (logId: string) => {
    const val = parseInt(overrideCalorieInput, 10);
    if (isNaN(val)) return;

    setMeals((prev) => {
      const updated = prev.map((m) => (m.id === logId ? { ...m, user_override_calories: val } : m));
      const storageKey = `wa_diet_${profile?.id || 'active'}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    setEditingLogId(null);
    setOverrideCalorieInput('');
  };

  // Calculations
  const todayMeals = meals.filter((m) => m.log_date === todayStr);
  const totalCalories = todayMeals.reduce(
    (sum, m) => sum + (m.user_override_calories ?? m.gemini_calories ?? 0),
    0
  );
  const totalProtein = todayMeals.reduce((sum, m) => sum + (Number(m.gemini_protein_g) || 0), 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + (Number(m.gemini_carbs_g) || 0), 0);
  const totalFat = todayMeals.reduce((sum, m) => sum + (Number(m.gemini_fat_g) || 0), 0);

  const calorieDelta = totalCalories - tdeeTarget;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan">AI NUTRITION ENGINE</Badge>
            <span className="text-xs text-gray-400 font-mono">Google Gemini Flash Structured Parse</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Health & Diet Tracking</h1>
        </div>

        {/* Daily Summary Card */}
        <Card className="p-6 mb-8 border-primary/20 bg-white/[0.03]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                Today's Energy Balance ({todayStr})
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-bold text-white font-mono">{totalCalories}</span>
                <span className="text-xs text-gray-400">/ {tdeeTarget} kcal target (TDEE)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={calorieDelta > 0 ? 'warning' : 'cyan'}
                className="text-xs px-3 py-1 font-mono"
              >
                {calorieDelta > 0 ? `+${calorieDelta} kcal Surplus` : `${calorieDelta} kcal Deficit`}
              </Badge>
            </div>
          </div>

          {/* Macro Split */}
          <div className="grid grid-cols-3 gap-4 pt-4 text-center">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[11px] text-gray-400 block uppercase">Protein</span>
              <span className="text-lg font-bold text-cyan-300 font-mono">{Math.round(totalProtein)}g</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[11px] text-gray-400 block uppercase">Carbohydrates</span>
              <span className="text-lg font-bold text-amber-300 font-mono">{Math.round(totalCarbs)}g</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[11px] text-gray-400 block uppercase">Fats</span>
              <span className="text-lg font-bold text-rose-300 font-mono">{Math.round(totalFat)}g</span>
            </div>
          </div>
        </Card>

        {/* Meal Logging Form */}
        <Card className="p-6 mb-8 border-white/[0.08]">
          {/* Meal phase tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {MEAL_TYPES.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMealType(m.id)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  activeMealType === m.id
                    ? 'bg-primary/15 border-primary/40 text-white shadow-[0_0_15px_rgba(79,209,255,0.15)]'
                    : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.name}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleEstimateMeal} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Describe what you ate for {activeMealType.toUpperCase()}
              </label>
              <textarea
                rows={3}
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                placeholder={MEAL_TYPES.find((m) => m.id === activeMealType)?.placeholder}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.1] p-3 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all resize-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full gap-2"
              disabled={!itemsText.trim() || isAnalyzing}
              isLoading={isAnalyzing}
            >
              <Sparkles className="w-4 h-4" />
              <span>Instant Gemini Calorie & Macro Calculation</span>
            </Button>
          </form>
        </Card>

        {/* Logged Meals List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider font-mono">
            Meals Logged Today
          </h3>

          <div className="space-y-3">
            {todayMeals.map((meal) => {
              const calories = meal.user_override_calories ?? meal.gemini_calories ?? 0;
              const isEditing = editingLogId === meal.id;

              return (
                <div
                  key={meal.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase font-mono font-bold text-primary">
                        {meal.meal_type}
                      </span>
                      {meal.user_override_calories && (
                        <Badge variant="outline" className="text-[10px]">
                          User Overridden
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-200">{meal.items_text}</p>
                    {meal.gemini_summary && (
                      <p className="text-xs text-gray-400 mt-1 italic">{meal.gemini_summary}</p>
                    )}
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-3 font-mono">
                      <span>P: {meal.gemini_protein_g || 0}g</span>
                      <span>C: {meal.gemini_carbs_g || 0}g</span>
                      <span>F: {meal.gemini_fat_g || 0}g</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          placeholder="kcal"
                          value={overrideCalorieInput}
                          onChange={(e) => setOverrideCalorieInput(e.target.value)}
                          className="w-24 h-8 text-xs py-1"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveOverride(meal.id)}
                          className="h-8 text-xs px-2"
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-lg font-bold text-white font-mono">{calories} kcal</div>
                        <button
                          onClick={() => {
                            setEditingLogId(meal.id);
                            setOverrideCalorieInput(String(calories));
                          }}
                          className="text-[11px] text-gray-500 hover:text-primary transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Override</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
