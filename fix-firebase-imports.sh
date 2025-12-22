#!/bin/bash

# Script to remove Firebase imports and replace with auth service
# This will update all files that still import Firebase

FRONTEND_DIR="/Users/mac/Downloads/bianluns(9.5:10)/tournament-frontend/src"

echo "Fixing Firebase imports in all files..."

# List of files to fix
files=(
  "components/TournamentSignup.tsx"
  "pages/TournamentDetail.tsx"
  "pages/Resources.tsx"
  "pages/TournamentOrganizer.tsx"
  "components/BracketManager.tsx"
  "pages/Home.tsx"
  "pages/Judgelist.tsx"
  "pages/AddResource.tsx"
  "pages/RunTimer.tsx"
  "pages/Profile.tsx"
  "pages/JudgeDetail.tsx"
  "pages/PaymentSuccessPage.tsx"
  "pages/ProjectList.tsx"
  "pages/CreateProject.tsx"
  "pages/RegistrationManagement.tsx"
  "pages/JudgeProfile.tsx"
  "pages/SubscriptionManagement.tsx"
  "pages/OrganizerDashboard.tsx"
  "pages/RateJudgePage.tsx"
  "pages/TournamentBracket.tsx"
  "utils/updateVipStatus.ts"
)

for file in "${files[@]}"; do
  filepath="$FRONTEND_DIR/$file"
  if [ -f "$filepath" ]; then
    echo "Processing $file..."
    
    # Create backup
    cp "$filepath" "${filepath}.bak"
    
    # Replace Firebase auth imports
    sed -i '' 's/from ['\''"]firebase\/auth['\''"]/from '\''..\/services\/authService'\''/g' "$filepath"
    sed -i '' 's/from ['\''"]firebase\/firestore['\''"]/\/\/ REMOVED: Firestore import/g' "$filepath"
    sed -i '' 's/from ['\''"]..\/firebase['\''"]/\/\/ REMOVED: Firebase import/g' "$filepath"
    sed -i '' 's/from ['\''"]\.\.\/\.\.\/firebase['\''"]/\/\/ REMOVED: Firebase import/g' "$filepath"
    
    # Replace common Firebase functions
    sed -i '' 's/getAuth([^)]*)/auth/g' "$filepath"
    sed -i '' 's/getFirestore([^)]*)/\/\/ REMOVED: getFirestore/g' "$filepath"
    
    echo "✓ Fixed $file"
  else
    echo "✗ File not found: $filepath"
  fi
done

echo ""
echo "All files processed! Backups created with .bak extension"
echo "If everything works, you can remove backups with: find $FRONTEND_DIR -name '*.bak' -delete"



