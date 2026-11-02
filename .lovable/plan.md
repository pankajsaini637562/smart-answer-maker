# Menu button (three lines) for the top bar

## What changes
- The row of page links in the top bar (Home, Courses, Materials, Sheets, History, Leaderboard, Analytics, Teach, Admin) is replaced by a three-line menu button, on all screen sizes.
- Tapping it slides a panel in from the side with every link listed one under another: icon + name, large enough to tap easily on a phone. The page you're on is highlighted.
- Tapping a link opens that page and closes the panel. Tapping outside the panel or the X also closes it.
- The logo, dark/light toggle and profile button stay where they are.
- Same paper-and-ink style, flat bordered look, orange highlight for the current page.

## Technical details
- Edit only `src/components/AppHeader.tsx`: remove the desktop `nav` and the mobile icon `nav`; add a `Menu` icon button that opens the existing `Sheet` (`side="left"`), controlled with `open` state, closing on link click and on route change.
- Teach/Admin entries remain conditional on role.
