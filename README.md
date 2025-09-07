# Work Lunch Saver

Simple static app that tracks how much you've saved by making lunch at home instead of buying one for £3.40. Each home-made lunch is assumed to cost £0.30, so each saved lunch equals £3.10.

Files:
- `index.html` - main page
- `css/styles.css` - styling
- `js/script.js` - app logic, uses `localStorage` to persist totals

How it works:
- Click "Add a lunch saved" to add £3.10 to your total and increment the lunch count.
- "Undo last" removes the last addition.
- "Reset" clears all data.
- Data is stored in your browser's `localStorage` so it stays on this device/browser.

Run locally:
Open `index.html` in a browser.

Publish to GitHub Pages:
1. Create a new public repository on GitHub (for example `worklunchsaver`).
2. Commit and push these files to the repository's `main` branch.
3. In the repository settings -> Pages, set the source to the `main` branch and root folder (`/`).
4. Save and wait a minute; your site will be available at `https://<your-username>.github.io/<repo-name>/`.

Notes:
- This is a plain static site and works on GitHub Pages without a build step.
- If you want multiple users or cross-device sync, you'd need a server or external storage.
