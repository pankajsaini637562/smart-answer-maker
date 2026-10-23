# Smart OMR Analysts | AI-Powered OMR Sheet  & Grader

Here is a precise prompt you can feed into any AI code generator or app-builder platform so it builds an app just like the two Android apps you linked:

OMR ~ Dynamic OMR Sheet (ReaK AbC & Co.)
This app lets users create unlimited OMR sheets, get question-wise reports, use a timer and stopwatch, choose 4 or 5 options, reuse tests, download PDF reports, and auto-save progress. It also has night mode and multiple correct answers support. 

OMR (Surya Vedantam)
This app provides a traditional digital OMR experience with countdown timer, stopwatch, scoreboard (last five scores), deselect option, PDF review exports, and access to saved reports. 


Below is your comprehensive prompt to generate a similar app with dynamic OMR creation, detailed analysis, offline support, and all key features:


---

PROMPT FOR AI APP BUILDER

Create a fully functional OMR (Optical Mark Recognition) Android app named Exam Master that matches the scope and features of the two existing OMR apps like OMR ~ Dynamic OMR Sheet and OMR. The app should be robust, user-friendly, and optimized for smartphone use, targeted at students preparing for competitive and school exams.

The app must include the following functional requirements:

1. OMR Test Builder

1. Allow users to create unlimited OMR sheets with a variable number of questions.


2. Provide choice to define 4 options or 5 options per question.


3. Allow users to enter answer keys manually or paste them later after attempting the sheet.


4. Support multiple choice questions with multiple correct answers if required.



2. Exam Mode & Controls

1. Include an inbuilt countdown timer and stopwatch for exam simulation.


2. Provide navigation to jump between questions.


3. Enable deselecting selected options.


4. Show the number of remaining unanswered questions.


5. Keep data safe if the user exits the app or rotates the device (auto-save).


6. Night mode toggle.



3. Scoring & Reporting

1. Score the exam automatically after submission.


2. Provide question-wise accuracy analysis.


3. Show total marks, correct/wrong count, unattempted count, and accuracy percentage.


4. Save the exam results with a timestamped entry in a Scoreboard that shows at least the last five results.


5. Allow retrying an exam without re-entering answers.



4. Review & Analytics

1. Provide a review section where users can revisit questions they got wrong or marked for review.


2. Generate and display comparison between user answers and correct answers.


3. Provide summary text that users can share via text or social apps.



5. PDF Export & History

1. Enable users to download detailed result reports in PDF format.


2. The PDF must show:

Test title, date, duration

Total questions

User’s score and analytics

Question-wise result breakdown



3. Add a Review List page where saved PDF reports are listed and accessible.


4. Allow deleting saved reports by long-press.



6. UI & UX

1. Simple, clean OMR sheet UI with clear marking bubbles.


2. The OMR screen must resemble a real exam OMR sheet, with rows and circled answer bubbles.


3. Provide a navigation panel showing progress (answered, unanswered, marked for review).


4. Include dark and light theme options.



7. Offline Support & Storage

1. All exams, answers, scoreboards, and generated reports must be stored locally.


2. No mandatory account login is required, but if a login is implemented, sync results after login.



8. Export & Share

1. Share score summaries and analytics via messaging or social sharing APIs.


2. Export PDF results to device storage.



Additional Expectations

1. Provide clean error handling (e.g., prevent data loss if back button is tapped).


2. Scoring should be configurable to include negative marking.


3. Ensure performance is smooth on mid-range devices.


4. Use modular code so that future features like cloud sync or login can be added.




---

If you want, I can extend this prompt with UX flows, screen mockups as text descriptions, or JSON schema definitions for the OMR sheet format. Just tell me what you need next.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://smartaiomranalyis.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/daab3b32-b18b-4eff-afa4-bf28a6ef5d77).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
