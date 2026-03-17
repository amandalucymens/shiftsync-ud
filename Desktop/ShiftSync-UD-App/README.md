# ShiftSync UD - Build Tutorial

This folder contains a **static tutorial website** (HTML/CSS/JS) that teaches you how to build the ShiftSync UD web app using **Next.js + InstantDB + Tailwind**, and deploy it on **Vercel**.

## Files in this tutorial site

- `index.html` — Page 1: Introduction & Concepts
- `setup.html` — Page 2: Prerequisites & Setup
- `build.html` — Page 3: Building Your App (includes the ShiftSync UD build prompt)
- `deploy.html` — Page 4: Deployment to Vercel
- `reference.html` — Page 5: Next Steps & Troubleshooting
- `styles.css` — Shared custom styles
- `scripts.js` — Shared JavaScript (copy buttons, accordions, smooth scroll, fade-in)

## Viewing this tutorial

### Quick Start: view locally

1. Open `index.html` in your web browser (double-click it).
2. Use the top navigation bar to move through the pages.

## Host on GitHub Pages (recommended)

### Step 1: Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in.
2. Click the **+** button (top right) → **New repository**.
3. Name it something like `shiftsync-ud-tutorial`.
4. Select **Public**.
5. Click **Create repository**.

### Step 2: Upload these files

1. In your new repo, click **“uploading an existing file”**.
2. Drag and drop **all** of these files from this folder:
   - `index.html`
   - `setup.html`
   - `build.html`
   - `deploy.html`
   - `reference.html`
   - `styles.css`
   - `scripts.js`
   - `README.md`
3. Click **Commit changes**.

### Step 3: Enable GitHub Pages

1. In your repo, go to **Settings** → **Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Select:
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **Save**.

### Step 4: View your live tutorial

After a few minutes, your tutorial will be live at:

```
https://YOUR-USERNAME.github.io/REPOSITORY-NAME/
```

## Next steps

1. Start at `index.html` and follow the tutorial pages in order.
2. On the Build page, copy the build prompt into Cursor (and replace `YOUR_APP_ID_HERE`).
3. Deploy your finished ShiftSync UD app to Vercel.

