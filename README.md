# Campus Stores

## Submission summary

**Kept:** the issue form and its guardrails. Units in repair are hidden, and equipment outside the approved request or beyond the approved quantity is blocked.

**Changed:** returns now work on the whole kit instead of one slip at a time.

What was done:

- **Anyone can collect:** "Collected by" is no longer limited to a fixed list. Choosing "Someone else…" asks for their name and roll number, so a walk-up student is never turned away. They are remembered for later slips and returns, and their roll number shows next to their name.
- **Kit return:** Record return opens every open slip on that request, with the clicked unit already ticked.
- **Partial returns:** anything not ticked needs who has it and when it is coming back. This shows on the register row and is written to the desk book as a handover note linked to the slip.
- **Wrong unit check:** for lookalike units (AD-12 / AD-15) staff confirm the label. A mismatch is flagged and noted, and the missing unit is marked Missing so it cannot be issued.
- **Clear feedback:** ticked units turn green and units still out turn amber. The save button previews the result, and a banner confirms the save with Undo.
- **Morning shift:** register rows lead with the item, show who holds it and mark late items.
- **Error handling:** validation moves focus to the missing field, return times that have passed are not offered, and stale saved data is ignored safely.
- **Visual refresh:** a clean, light layout with a quiet sidebar and a Pickup › Return › Morning progress line. Colour is used only for state: green for back, amber for out or late. It works at phone width.
- **Tests:** 49 Playwright tests cover the full shift and its edge cases. Run `npm install`, `npx playwright install chromium`, then `npm test`.

**Try it:** open `index.html`, issue the Film Society kit (PR-04, SP-02, AD-12) to Kabir in the Loan register, move to 7:30 and press Record return on the projector.

**Files changed:** `app.js`, `styles.css`, `tests/`, `package.json`, `playwright.config.js` (`index.html` gets one line for the progress steps).

## The decision in my words

what the product does well is the issue form. at pickup PR-06 is in repair so it just never shows up, and the form wont let you hand out stuff thats not on the approved request or a second unit of the same thing.  kabir cant leave with a dead projector 15 min before the film and i didnt have to think about it. didnt touch any of that.

what i would change is the return. at 7:30 kabir puts the projector and speaker on the counter and says leela has the adapter till tomorow. the old app closed one slip at a time and had no idea anything was still out or who had it. the only way to tell the morning shift was a free text note you had to remember to write, linked to nothing, so next morning your matching prose to RQ-214 by hand while leela waits.

so now the return works on the whole kit, the way kabir actually says it. pickup is the same. at 7:30 record return on the projector opens the whole film society kit with the projector already ticked and asks "What’s on the counter? Tick it and check the label."  you tick the speaker. the adapter is the only thing left so its the only thing asking "Who has it" and "Bringing it back", pick leela and sat 9 am, save. forget one and it puts you right on the empty box instead of failing quietly at the bottom. ticked rows go green and whats still out goes amber, the save button says "2 back, 1 still out" before you even press it, and after saving a green banner on top reads it back, "Back: HDMI projector, Portable speaker. Still out: USB-C → HDMI adapter with Leela Das till Sat 9 am." with an undo return button right there incase you ticked the wrong thing, and the desk book gets the note written for you: "Film Society’s USB-C → HDMI adapter (AD-12) is still out. Leela Das has it, back Sat 9 am. Slip L-404 stays open."

saturday 9 am the new person doesnt need any of that story.  the row says "Film Society · Leela Das has it, back Sat 9 am · issued to Kabir Sen, due Fri 8 pm" with a small Late tag. leela walks in, her name is right there, record return, already ticked, save. two clicks. every row also shows item type and club now becuase RQ-214 alone means nothing to someone who just walked in.


what i was going for is less a feature and more how it feels at the counter. it talks the way people at the desk talk, only asks for what it needs right now, and lets you take a mistake back. kept the one slip per unit model, the guardrails and the desk book.

one thing id watch at a real counter: at 9 am when leela walks in, does the person who just started close her slip straight away without asking anyone or digging through the desk book. if yes it helped,  if they still ask around it didnt.

tests are playwright, they open index.html straight from disk. npm install, npx playwright install chromium, npm test.  49 of them, mostly awkward stuff: wrong adapter back, nothing ticked, forgetting who has it, a time that already passed, undo, broken saved data, storage blocked, html in a note, phone width, keyboard only. the guardrails i kept have one too.

the scene literally says close the loan for the right item, and AD-12 and AD-15 look the same in the same bin. so when a unit has a lookalike, ticking it shows "Label on the unit says" set to the slip's unit. if leela hands over AD-15 you pick that, the slip still closes but its flagged, "Slip L-404 said AD-12 but AD-15 came back, AD-12 marked missing.", the desk book gets a note to go find AD-12 and inventory shows it Missing so nobody hands it out. kept on record, not quietly fixed.

things i didnt do: no barcode scan, the label check is still just your eyes on the sticker.

---

original readme below

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

## Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records.

## Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).


## Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
