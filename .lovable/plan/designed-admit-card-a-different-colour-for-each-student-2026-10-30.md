# Designed admit card, a different colour for each student

Swap the plain text admit card for a landscape PDF laid out like the uploaded design. Each student gets their own colour theme.

## Layout (one landscape A4 page)
- **Header band:** SAINI TECHLABS logo and name, "SMART AI OMR, CBT Examination System", and the line "Smarter Examinations, Brighter Futures".
- **Title pill:** "CBT EXAMINATION ADMIT CARD".
- **Student Details panel:** photo box (shows the student's photo if it's turned on and uploaded, otherwise an empty outline), name, highlighted roll number, class, stream, coaching institute, batch, academic session.
- **Examination Details panel:** exam name, code, subject, date, reporting time, start time, duration, mode, and venue or instructions.
- **Verification & Reference panel:** a real QR code linking to the admit card check page, the reference number, issue date, and a "VALID" badge.
- **Important Instructions:** the exam's own instructions, or the standard 5 points from the design when the exam has none. Includes the "Your Effort Builds Your Future" note.
- **Footer band:** "Powered by SAINI TECHLABS" and "Analyze. Evaluate. Improve."
- Passwords never appear on the card.

## Colours for each student
- 8 colour themes: blue, teal, green, orange, crimson, purple, indigo, slate.
- Each student's theme is picked from their roll number, so the same student always gets the same colour, and students next to each other usually get different ones.
- The theme changes the header, footer, panel headings and roll number highlight. The body stays white so the text is easy to read and print.

## Where it applies
- Students download the new design from "My Admit Cards".
- When admins generate or preview cards, they get the same design. Each card keeps its own snapshot details.

## Technical details
- Rewrite `cardPdf` in `src/lib/cbtPortal.ts` with jsPDF drawing tools (rect, roundedRect, text) in landscape A4. Leave `createReportPdf` unchanged for reports.
- Add the `qrcode` package and embed the code as a PNG data URL pointing to `/cbt/verify/<reference>`.
- Load the logo from the existing logo pointer, converted to PNG through a canvas before embedding. Do the same for the photo when it exists. This makes `cardPdf` async, so update its callers to `await` it.
- Add a pure `admitCardTheme(roll)` helper and a test showing that the same roll always gets the same theme and that the theme list covers all 8 colours.
- Check the result by rendering a sample PDF to an image and looking at it.
