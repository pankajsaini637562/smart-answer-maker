import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getLeaderboard from "./tools/get-leaderboard";
import getMyProfile from "./tools/get-my-profile";
import getMyRecentResults from "./tools/get-my-recent-results";
import listMySheets from "./tools/list-my-sheets";

// Direct Supabase issuer (never the .lovable.cloud proxy). Built from the
// project ref that Vite inlines at build time so this stays import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "smart-ai-omr-analysis-mcp",
  title: "Smart AI OMR Analysis",
  version: "0.1.0",
  instructions:
    "Tools for the Smart AI OMR Analysis exam prep app. Use `get_leaderboard` for the public top-XP ranking. Authenticated tools return the signed-in student's profile (`get_my_profile`), recent exam results (`get_my_recent_results`), and saved OMR sheets (`list_my_sheets`).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getLeaderboard, getMyProfile, getMyRecentResults, listMySheets],
});
