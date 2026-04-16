#!/usr/bin/env bash
# Install git hooks for fahad-memoir.
# Run once per clone (PC, Mac, etc.): bash scripts/install-hooks.sh
set -e
repo_root="$(git rev-parse --show-toplevel)"
hook="$repo_root/.git/hooks/post-commit"

cat > "$hook" <<'EOF'
#!/usr/bin/env bash
branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" = "beta" ]; then
  echo "[post-commit] beta branch → pushing to beta-remote (GitHub Pages)"
  git push beta-remote beta:main 2>&1 | tail -3
fi
EOF
chmod +x "$hook"

# Ensure beta-remote exists
if ! git remote | grep -q '^beta-remote$'; then
  git remote add beta-remote https://github.com/fahadnoor001/fahad-memoir-beta.git
  echo "Added beta-remote."
fi

echo "Hooks installed. Commits on 'beta' branch auto-push to fahad-memoir-beta → GitHub Pages."
