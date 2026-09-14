# 🏦 Central Bank Governor - Economic Simulation Game

A modern React/TypeScript remake of the Central Bank Game. Play as a central bank governor managing monetary policy over 36 months.

## 🎮 Play Now

**Live Demo:** [Play the game](https://hutkudemir.github.io/central-bank-game-react/)

## 🚀 Quick Deploy to GitHub Pages

### Step 1: Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `central-bank-game-react`
3. Keep it **Public**
4. ✅ Check "Add a README file"
5. Click **Create repository**

### Step 2: Upload Files
Since you don't have the project locally, use one of these methods:

#### Method A: GitHub Web Upload (Easiest)
1. In your new repo, click **"Add file" → "Upload files"**
2. **Download all project files** from this environment (see instructions below)
3. Drag all files into the upload area
4. Click **"Commit changes"**

#### Method B: GitHub Codespaces
1. In your new repo, click **Code → Codespaces → Create codespace**
2. Open the terminal in Codespaces
3. Run these commands:
```bash
# Clone this project template
npx degit your-username/central-bank-game-react .
npm install
npm run build
```

### Step 3: Enable GitHub Pages
1. Go to **Settings → Pages**
2. Under "Source", select **GitHub Actions**
3. The workflow will auto-deploy on every push!
4. Your game will be live at: `https://YOUR-USERNAME.github.io/central-bank-game-react/`

## 📥 How to Download Project Files

Since the project is in this preview environment, you need to download it:

### Option 1: Copy-Paste Method (Recommended)
1. Create a new folder on your computer
2. Open each file from the file explorer in this environment
3. Copy the content and paste into matching files in your folder
4. Key files to copy:
   - `package.json`
   - `vite.config.ts`
   - `tsconfig.json`
   - `index.html`
   - `src/App.tsx`
   - `src/main.tsx`
   - `src/index.css`
   - All files in `src/components/`
   - All files in `src/store/`
   - All files in `src/data/`
   - All files in `src/hooks/`
   - `.github/workflows/deploy.yml`

### Option 2: Download ZIP
If this environment supports file downloads:
1. Look for a "Download" button in the interface
2. Download the ZIP file
3. Extract it
4. Upload to GitHub

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Game Features

- **Realistic Economic Model** - Taylor rule, Phillips curve, inflation expectations
- **3 Distinct Advisors** - Keynesian, Monetarist, Supply-Side perspectives
- **Country-Specific Scenarios** - Türkiye, United States, Euro Area
- **Voice Features** - Reporters speak questions, students can answer by voice
- **Press Conferences** - Answer journalist questions, graded by simulated public
- **Bilingual** - English and Turkish support
- **3 Difficulty Levels** - Easy, Medium, Hard

## 📋 Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- Zustand (state management)
- Recharts (charts)
- Lucide React (icons)
- Web Speech API (voice)

## 📄 License

MIT License - feel free to use and modify!
