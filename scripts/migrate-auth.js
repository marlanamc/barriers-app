const fs = require('fs');

const files = [
  'app/command-center/page.tsx',
  'app/patterns/page.tsx',
  'app/onboarding/complete/page.tsx',
  'app/calendar/page.tsx',
  'app/for-later/page.tsx',
  'app/calendar/[date]/page.tsx',
  'app/toolkit/page.tsx',
  'app/gentle-support/page.tsx',
  'app/brain-dump/page.tsx',
  'app/settings/page.tsx',
  'app/upcoming/page.tsx',
  'app/all-tasks/page.tsx',
  'app/focus/page.tsx',
  'app/plan-ahead/page.tsx',
  'app/plan-ahead/focus/page.tsx',
  'app/map/[module]/page.tsx',
  'app/plan-ahead/edit/[id]/page.tsx',
  'components/modals/TaskModal.tsx',
  'components/modals/QuickAddModal.tsx',
  'components/CustomTagsEditor.tsx',
  'components/CustomAnchorsEditor.tsx',
  'lib/useEnergySchedule.ts'
];

let successCount = 0;
let errorCount = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');

    // Replace import
    content = content.replace(
      /import { useSupabaseUser } from '@\/lib\/useSupabaseUser';/g,
      "import { useAuth } from '@/components/AuthProvider';"
    );

    // Replace hook usage patterns
    content = content.replace(
      /const { user, loading: authLoading } = useSupabaseUser\(\);/g,
      'const { user } = useAuth();'
    );
    content = content.replace(
      /const { user, loading: userLoading } = useSupabaseUser\(\);/g,
      'const { user } = useAuth();'
    );
    content = content.replace(
      /const { user, loading } = useSupabaseUser\(\);/g,
      'const { user } = useAuth();'
    );
    content = content.replace(
      /const { user } = useSupabaseUser\(\);/g,
      'const { user } = useAuth();'
    );

    // Remove authLoading/userLoading from conditions
    content = content.replace(/if \(authLoading \|\| loading\)/g, 'if (loading)');
    content = content.replace(/if \(userLoading \|\| loading\)/g, 'if (loading)');
    content = content.replace(/authLoading \|\| /g, '');
    content = content.replace(/userLoading \|\| /g, '');

    // Fix dependency arrays
    content = content.replace(/\[user, authLoading\]/g, '[user]');
    content = content.replace(/, authLoading\]/g, ']');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Updated ${file}`);
    successCount++;
  } catch (err) {
    console.error(`✗ Error updating ${file}:`, err.message);
    errorCount++;
  }
});

console.log(`\nDone! ${successCount} files updated, ${errorCount} errors`);
