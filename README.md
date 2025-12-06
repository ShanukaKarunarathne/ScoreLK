# Cricket Score Tracker - ScoreLK

A simple, mobile-friendly cricket score tracking web application.

## Features

- ✅ Track scores for two teams simultaneously
- ✅ Add runs (0, 1, 2, 3, 4, 6)
- ✅ Track wickets
- ✅ Automatic over counting
- ✅ Wide and No Ball tracking (adds 1 run without counting the ball)
- ✅ Current over ball-by-ball display
- ✅ Random toss functionality
- ✅ Undo last action
- ✅ Switch innings
- ✅ Reset match
- ✅ Mobile-responsive design

## How to Use

1. **Start with Toss**: Go to the toss page to enter team names and perform a random toss
2. **Score Tracking**: Use the main page to track runs, wickets, and extras
3. **Extras**: Wide and No Ball add 1 run without counting as a ball
4. **Overs**: Automatically calculated (6 legal balls = 1 over)
5. **Switch Innings**: Click "Switch Innings" when the first team is all out or completes their overs

## Deployment on Netlify

1. Push this folder to a GitHub repository
2. Go to [Netlify](https://www.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Deploy!

Or simply drag and drop this folder to Netlify's deployment zone.

## Files

- `index.html` - Main score tracking page
- `toss.html` - Toss page for team names and random toss
- `styles.css` - Styling for both pages
- `script.js` - Score tracking logic
- `netlify.toml` - Netlify configuration

## Cricket Scoring Rules Implemented

- **Runs**: 0, 1, 2, 3, 4, 6
- **Wide/No Ball**: Adds 1 run, ball doesn't count toward the over
- **Wicket**: Increments wicket count and ball count
- **Over**: 6 legal balls = 1 over
- **Overs Display**: Shows as X.Y (e.g., 3.2 = 3 overs and 2 balls)
