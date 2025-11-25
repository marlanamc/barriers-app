'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useMapData } from '@/hooks/useMapData';
import { MAP_MODULES, getModuleDefinition } from '@/lib/map-modules';
import { ModuleEditor } from '@/components/map/ModuleEditor';
import { ListModuleEditor } from '@/components/map/ListModuleEditor';
import { LifeVestEditor } from '@/components/map/LifeVestEditor';
import { CrewEditor } from '@/components/map/CrewEditor';
import { StarlightEditor } from '@/components/map/StarlightEditor';
import { Ship } from 'lucide-react';

// Map URL slugs to module keys
const SLUG_TO_KEY: Record<string, string> = {
  'life-vest': 'life_vest',
  'fuel-habits': 'fuel_habits',
  'north-star': 'north_star',
  'destination': 'destination',
  'lighthouse': 'lighthouse',
  'anchor': 'anchor',
  'compass-setup': 'compass_setup',
  'energy-patterns': 'energy_patterns',
  'storms': 'storms',
  'drift-sirens': 'drift_sirens',
  'lifeboat': 'lifeboat',
  'buoy': 'buoy',
  'crew': 'crew',
  'logbook-style': 'logbook_style',
  'starlight': 'starlight',
};

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // Get module key from URL slug
  const slug = params.module as string;
  const moduleKey = SLUG_TO_KEY[slug];
  const module = moduleKey ? getModuleDefinition(moduleKey) : undefined;

  const {
    data,
    loading: dataLoading,
    saving,
    saveModule,
    saveToolkit,
    saveLifeVestTools,
    saveCrewContacts,
    addStarlightWin,
    removeStarlightWin,
  } = useMapData(user?.id);

  const loading = dataLoading;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Ship className="mx-auto h-8 w-8 animate-pulse text-cyan-600 dark:text-cyan-400" />
          <p className="mt-3 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Module not found
  if (!module) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-cyan-50 px-4 dark:from-slate-900 dark:to-slate-800">
        <p className="text-slate-600 dark:text-slate-400">Module not found</p>
        <button
          onClick={() => router.push('/map')}
          className="mt-4 text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400"
        >
          Back to Map
        </button>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-cyan-50 px-4 dark:from-slate-900 dark:to-slate-800">
        <p className="text-slate-600 dark:text-slate-400">Please sign in</p>
      </div>
    );
  }

  // Redirect special modules to their dedicated pages
  if (moduleKey === 'energy_patterns') {
    router.push('/sails-and-oars');
    return null;
  }

  if (moduleKey === 'starlight') {
    router.push('/starlight');
    return null;
  }

  // Handle different module types
  switch (moduleKey) {
    // Modules stored in user_toolkit table
    case 'north_star': {
      const value = data.toolkit?.north_star || '';
      return (
        <ModuleEditor
          module={module}
          initialValue={value}
          onSave={async (newValue) => {
            return saveToolkit({ north_star: newValue });
          }}
          saving={saving}
        />
      );
    }

    case 'lighthouse': {
      const value = data.toolkit?.lighthouse || '';
      return (
        <ModuleEditor
          module={module}
          initialValue={value}
          onSave={async (newValue) => {
            return saveToolkit({ lighthouse: newValue });
          }}
          saving={saving}
        />
      );
    }

    case 'anchor': {
      const value = data.toolkit?.anchor_question || '';
      return (
        <ModuleEditor
          module={module}
          initialValue={value}
          onSave={async (newValue) => {
            return saveToolkit({ anchor_question: newValue, anchor_type: 'custom' });
          }}
          saving={saving}
        />
      );
    }

    // List-based modules
    case 'fuel_habits': {
      const content = data.fuel_habits;
      return (
        <ListModuleEditor
          module={module}
          initialItems={content?.habits || []}
          initialNotes={content?.notes || ''}
          onSave={async (items, notes) => {
            return saveModule('fuel_habits', { habits: items, notes });
          }}
          saving={saving}
        />
      );
    }

    case 'storms': {
      const content = data.storms;
      return (
        <ListModuleEditor
          module={module}
          initialItems={content?.challenges || []}
          initialNotes={content?.notes || ''}
          onSave={async (items, notes) => {
            return saveModule('storms', { challenges: items, notes });
          }}
          saving={saving}
        />
      );
    }

    case 'drift_sirens': {
      const content = data.drift_sirens;
      return (
        <ListModuleEditor
          module={module}
          initialItems={content?.distractions || []}
          initialNotes={content?.notes || ''}
          onSave={async (items, notes) => {
            return saveModule('drift_sirens', { distractions: items, notes });
          }}
          saving={saving}
        />
      );
    }

    case 'lifeboat': {
      const content = data.lifeboat;
      return (
        <ListModuleEditor
          module={module}
          initialItems={content?.tools || []}
          initialNotes={content?.notes || ''}
          onSave={async (items, notes) => {
            return saveModule('lifeboat', { tools: items, notes });
          }}
          saving={saving}
        />
      );
    }

    // Text-based modules in map_modules table
    case 'destination': {
      const content = data.destination;
      return (
        <ModuleEditor
          module={module}
          initialValue={(content as { text?: string })?.text || ''}
          onSave={async (newValue) => {
            return saveModule('destination', { text: newValue });
          }}
          saving={saving}
        />
      );
    }

    case 'compass_setup': {
      const content = data.compass_setup;
      return (
        <ModuleEditor
          module={module}
          initialValue={content?.framework || ''}
          onSave={async (newValue) => {
            return saveModule('compass_setup', { framework: newValue });
          }}
          saving={saving}
        />
      );
    }

    case 'buoy': {
      const content = data.buoy;
      return (
        <ModuleEditor
          module={module}
          initialValue={(content as { text?: string })?.text || ''}
          onSave={async (newValue) => {
            return saveModule('buoy', { text: newValue });
          }}
          saving={saving}
        />
      );
    }

    case 'logbook_style': {
      const content = data.logbook_style;
      return (
        <ModuleEditor
          module={module}
          initialValue={(content as { text?: string })?.text || ''}
          onSave={async (newValue) => {
            return saveModule('logbook_style', { text: newValue });
          }}
          saving={saving}
        />
      );
    }

    // Special modules with their own editors
    case 'life_vest': {
      return (
        <LifeVestEditor
          module={module}
          initialTools={data.life_vest}
          onSave={saveLifeVestTools}
          saving={saving}
        />
      );
    }

    case 'crew': {
      return (
        <CrewEditor
          module={module}
          initialContacts={data.crew}
          onSave={saveCrewContacts}
          saving={saving}
        />
      );
    }

    default:
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-slate-600">Unknown module type</p>
        </div>
      );
  }
}
