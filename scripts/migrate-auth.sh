#!/bin/bash

# Script to migrate from useSupabaseUser to useAuth across the codebase

set -e

echo "Migrating authentication imports and usage..."

# List of files to update (found via grep)
files=(
  "app/command-center/page.tsx"
  "app/patterns/page.tsx"
  "app/onboarding/complete/page.tsx"
  "app/calendar/page.tsx"
  "app/for-later/page.tsx"
  "app/calendar/[date]/page.tsx"
  "app/context/AppContext.tsx"
  "app/toolkit/page.tsx"
  "app/gentle-support/page.tsx"
  "app/brain-dump/page.tsx"
  "app/settings/page.tsx"
  "app/upcoming/page.tsx"
  "app/all-tasks/page.tsx"
  "app/focus/page.tsx"
  "app/plan-ahead/page.tsx"
  "app/plan-ahead/focus/page.tsx"
  "app/map/page.tsx"
  "app/plan-ahead/save/page.tsx"
  "app/map/[module]/page.tsx"
  "app/plan-ahead/edit/[id]/page.tsx"
  "components/modals/TaskModal.tsx"
  "components/modals/QuickAddModal.tsx"
  "components/CustomTagsEditor.tsx"
  "components/CustomAnchorsEditor.tsx"
  "lib/useEnergySchedule.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."

    # Replace the import statement
    sed -i '' "s|import { useSupabaseUser } from '@/lib/useSupabaseUser';|import { useAuth } from '@/components/AuthProvider';|g" "$file"

    # Replace hook usage patterns
    sed -i '' "s|const { user, loading: authLoading } = useSupabaseUser();|const { user } = useAuth();|g" "$file"
    sed -i '' "s|const { user, loading: userLoading } = useSupabaseUser();|const { user } = useAuth();|g" "$file"
    sed -i '' "s|const { user, loading } = useSupabaseUser();|const { user } = useAuth();|g" "$file"
    sed -i '' "s|const { user } = useSupabaseUser();|const { user } = useAuth();|g" "$file"

    # Remove authLoading checks (AuthProvider handles loading state globally)
    sed -i '' "s|if (authLoading || loading)|if (loading)|g" "$file"
    sed -i '' "s|if (userLoading || loading)|if (loading)|g" "$file"
    sed -i '' "s|authLoading ||  *||g" "$file"
    sed -i '' "s|userLoading ||  *||g" "$file"

    # Remove authLoading from dependency arrays
    sed -i '' "s|\[user, authLoading\]|[user]|g" "$file"
    sed -i '' "s|, authLoading\]|]|g" "$file"

    echo "✓ Updated $file"
  else
    echo "⚠ File not found: $file"
  fi
done

echo ""
echo "Migration complete!"
echo "Remember to delete lib/useSupabaseUser.ts when done"
