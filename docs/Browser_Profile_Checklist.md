# Browser Profile Readiness Checklist

For the Command Center's automated agents (Playwright) to successfully interface with external tools like Canvas LMS and NotebookLM, the designated Google Chrome profile (`.browser_profiles/demo_profile`) must be properly configured.

## Pre-flight Checklist

Follow these steps **before** running the automation agents:

1. **Launch the Chrome Profile Manually**:
   - Open a terminal and launch Chrome with the designated user data directory:
     ```bash
     chrome.exe --user-data-dir="E:\Python\Sem Ops\Axiom-Shift\.browser_profiles\demo_profile"
     ```
   - Alternatively, use the provided `npm run launch-profile` script if configured in your environment.

2. **Authenticate with Canvas LMS**:
   - Navigate to your university's Canvas LMS portal.
   - Log in with your student credentials.
   - If prompted, check "Remember Me" or "Stay Signed In" to ensure the session token persists.
   - Verify you can access your dashboard without any secondary pop-ups.

3. **Authenticate with Google NotebookLM**:
   - Navigate to `https://notebooklm.google.com/`.
   - Log in with your Google account.
   - Complete any 2FA or CAPTCHA challenges manually.
   - Ensure you are on the main NotebookLM dashboard and that your notebooks load properly.

4. **Suppress Restore Prompts (Optional but Recommended)**:
   - If Chrome crashed previously, it may show a "Restore Pages" bubble. Close it.
   - To prevent it permanently, you can edit the `Preferences` file in the profile directory and set `"exit_type": "Normal"`.

5. **Close the Browser**:
   - Once all tabs load successfully without authentication walls, close the browser completely.
   - Ensure no background Chrome processes are clinging to the profile directory, otherwise Playwright will fail to launch with a profile lock error.

## Troubleshooting

- **Agent hangs at login**: If the Playwright script times out waiting for elements, it usually means the session expired. Repeat the manual login steps.
- **Profile Lock Error**: Make sure you have completely closed Chrome before starting the agent. Use Task Manager to kill lingering `chrome.exe` processes if necessary.
