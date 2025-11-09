"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, ArrowRight, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getBarriers, getBarrierBySlug, createCheckIn, ContentPage } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

const gradients = [
  'gradient-pink',
  'gradient-purple',
  'gradient-blue',
  'gradient-green',
  'gradient-yellow',
  'gradient-peach',
];

type Step = 'barriers' | 'barrier-tip' | 'complete';

export default function CheckInPage() {
  const router = useRouter();
  const [barriers, setBarriers] = useState<ContentPage[]>([]);
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>([]);
  const [barrierNotes, setBarrierNotes] = useState<Map<string, string>>(new Map());
  const [currentBarrierIndex, setCurrentBarrierIndex] = useState(0);
  const [currentBarrier, setCurrentBarrier] = useState<ContentPage | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('barriers');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-sign in as dummy user for development
    async function setupDummyUser() {
      // Try to sign in with a test account
      const testEmail = 'test@example.com';
      const testPassword = 'test123456';
      
      // First check if already signed in
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUserId(currentUser.id);
        loadBarriers();
        return;
      }
      
      // Try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        setAuthError(`Sign in failed: ${signInError.message}`);
        // If sign in fails, try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signUpError) {
          console.error('Error creating dummy user:', signUpError);
          setAuthError(`Sign up failed: ${signUpError.message}`);
        } else if (signUpData?.user) {
          console.log('Created new user:', signUpData.user.id);
          setUserId(signUpData.user.id);
          setAuthError(null);
        }
      } else if (signInData?.user) {
        console.log('Signed in user:', signInData.user.id);
        setUserId(signInData.user.id);
        setAuthError(null);
      }

      loadBarriers();
    }

    setupDummyUser();
  }, []);

  async function loadBarriers() {
    try {
      const data = await getBarriers();
      setBarriers(data);
    } catch (error) {
      console.error('Error loading barriers:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleBarrier(slug: string) {
    if (selectedBarriers.includes(slug)) {
      setSelectedBarriers(selectedBarriers.filter(b => b !== slug));
      setBarrierNotes(prev => {
        const next = new Map(prev);
        next.delete(slug);
        return next;
      });
    } else {
      if (selectedBarriers.length < 3) {
        setSelectedBarriers([...selectedBarriers, slug]);
      }
    }
  }

  function handleBarriersNext() {
    if (selectedBarriers.length === 0) return;
    
    // Load first barrier details
    const firstBarrierSlug = selectedBarriers[0];
    const barrier = barriers.find(b => b.slug === firstBarrierSlug);
    if (barrier) {
      setCurrentBarrier(barrier);
      setCurrentBarrierIndex(0);
      setCurrentStep('barrier-tip');
    }
  }

  function handleBarrierTipNext() {
    const currentSlug = selectedBarriers[currentBarrierIndex];
    
    // Move to next barrier or save
    if (currentBarrierIndex < selectedBarriers.length - 1) {
      const nextIndex = currentBarrierIndex + 1;
      const nextBarrier = barriers.find(b => b.slug === selectedBarriers[nextIndex]);
      if (nextBarrier) {
        setCurrentBarrier(nextBarrier);
        setCurrentBarrierIndex(nextIndex);
      }
    } else {
      // All barriers processed, save
      handleSave();
    }
  }

  function handleBarrierTipBack() {
    if (currentBarrierIndex > 0) {
      const prevIndex = currentBarrierIndex - 1;
      const prevBarrier = barriers.find(b => b.slug === selectedBarriers[prevIndex]);
      if (prevBarrier) {
        setCurrentBarrier(prevBarrier);
        setCurrentBarrierIndex(prevIndex);
      }
    } else {
      setCurrentStep('barriers');
    }
  }

  async function handleSave() {
    if (!userId) {
      alert('Please ensure you are signed in.');
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if check-in already exists for today
      const existingCheckIn = await supabase
        .from('daily_check_ins')
        .select('id')
        .eq('user_id', userId)
        .eq('check_in_date', today)
        .single();

      let checkIn;
      
      if (existingCheckIn.data) {
        // Update existing check-in
        const { data: updatedCheckIn, error: updateError } = await supabase
          .from('daily_check_ins')
          .update({
            selected_barriers: selectedBarriers,
            selected_tasks: [],
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCheckIn.data.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating check-in:', updateError);
          alert(`Error updating check-in: ${updateError.message}`);
          return;
        }
        checkIn = updatedCheckIn;
      } else {
        // Create new check-in
        checkIn = await createCheckIn(userId, {
          check_in_date: today,
          selected_barriers: selectedBarriers,
          selected_tasks: [],
        });
      }

      if (checkIn) {
        // Delete existing barrier selections for this check-in
        await supabase
          .from('barrier_selections')
          .delete()
          .eq('check_in_id', checkIn.id);

        // Create barrier selections with notes
        for (const barrierSlug of selectedBarriers) {
          const barrier = barriers.find(b => b.slug === barrierSlug);
          if (barrier) {
            const note = barrierNotes.get(barrierSlug) || null;
            const { error: insertError } = await supabase.from('barrier_selections').insert({
              check_in_id: checkIn.id,
              user_id: userId,
              barrier_slug: barrierSlug,
              barrier_name: barrier.name,
              issue_description: note,
            });
            
            if (insertError) {
              console.error('Error inserting barrier selection:', insertError);
            }
          }
        }
        
        setCurrentStep('complete');
        // Redirect to calendar after a moment
        setTimeout(() => {
          router.push('/calendar');
        }, 1500);
      } else {
        alert('Failed to save check-in. Please check the console for details.');
      }
    } catch (error: any) {
      console.error('Error saving check-in:', error);
      alert(`Error saving check-in: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
        <p className="text-gray-700">Loading barriers...</p>
      </main>
    );
  }

  const currentBarrierNote = currentBarrier ? barrierNotes.get(currentBarrier.slug) || '' : '';

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4">
        <Link href="/" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-xl font-semibold">
          <span className="text-gray-900">ADHD</span> <span className="text-pink-500">Barrier</span> <span className="text-gray-900">Tracker</span>
        </h1>
      </header>

      {/* Main Content */}
      <div className="px-4 pb-8 max-w-2xl mx-auto">
        {authError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-sm mb-4">
            {authError}
          </div>
        )}

        {/* Step 1: Barrier Selection */}
        {currentStep === 'barriers' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                What's your barrier?
              </h2>
              <p className="text-gray-700 mb-2">
                Select up to 3 barriers you're experiencing today
              </p>
            </div>

            {/* Barriers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {barriers.map((barrier, index) => {
                const isSelected = selectedBarriers.includes(barrier.slug);
                const gradient = gradients[index % gradients.length];
                
                return (
                  <button
                    key={barrier.slug}
                    onClick={() => toggleBarrier(barrier.slug)}
                    disabled={!isSelected && selectedBarriers.length >= 3}
                    className={`
                      ${gradient} p-5 rounded-2xl shadow-sm relative cursor-pointer 
                      transition-all text-left
                      ${isSelected ? 'ring-2 ring-pink-500 ring-offset-2' : ''}
                      ${!isSelected && selectedBarriers.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {barrier.emoji && (
                      <div className="text-3xl mb-2">{barrier.emoji}</div>
                    )}
                    <h3 className="font-bold text-base text-gray-900 mb-1">
                      {barrier.name}
                    </h3>
                    {barrier.subtitle && (
                      <p className="text-sm text-gray-700">
                        {barrier.subtitle}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={handleBarriersNext}
              disabled={selectedBarriers.length === 0}
              className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Step 2: Barrier Tip + Write More */}
        {currentStep === 'barrier-tip' && currentBarrier && (
          <>
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">
                Barrier {currentBarrierIndex + 1} of {selectedBarriers.length}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentBarrier.emoji && <span className="text-4xl mr-2">{currentBarrier.emoji}</span>}
                {currentBarrier.name}
              </h2>
            </div>

            {/* Tip Section */}
            {currentBarrier.gentle_advice && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-sm border border-pink-200">
                <div className="flex items-start gap-3 mb-3">
                  <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-gray-900">Tip</h3>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-0 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {currentBarrier.gentle_advice}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Write More Input */}
            <div className="mb-8">
              <label htmlFor="barrier-note" className="block text-lg font-semibold text-gray-900 mb-3">
                Want to write more about this?
              </label>
              <textarea
                id="barrier-note"
                value={currentBarrierNote}
                onChange={(e) => {
                  setBarrierNotes(prev => {
                    const next = new Map(prev);
                    next.set(currentBarrier.slug, e.target.value);
                    return next;
                  });
                }}
                placeholder="Share more details about this barrier..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleBarrierTipBack}
                className="flex-1 px-6 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors border-2 border-gray-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button
                onClick={handleBarrierTipNext}
                disabled={saving}
                className="flex-1 px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? 'Saving...' : currentBarrierIndex < selectedBarriers.length - 1 ? 'Next Barrier' : 'Save to Calendar'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Step 3: Complete */}
        {currentStep === 'complete' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Logged!
            </h2>
            <p className="text-gray-700">
              Redirecting to calendar...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
