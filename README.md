# Gemini Image Generator for Photoshop

This script connects Adobe Photoshop to Google's Gemini family of models, allowing you to generate images directly within your Photoshop workspace.

## Features

-   Generate images from a text prompt using the Gemini 2.5 Flash Image model.
-   The generated image is added as a new layer to your active document.
-   Saves your API key securely for future use.
-   Simple, easy-to-use dialog interface.

## 1. Requirements

-   Adobe Photoshop.
-   A Google Cloud Account with the Vertex AI API enabled.
-   A Google Cloud Project ID.
-   An Access Token for authentication.
-   **`curl` command-line tool.**
    -   `curl` is pre-installed on macOS and modern versions of Windows. If the script fails with a `curl` error, you may need to install it or ensure it's in your system's PATH.

## 2. First-Time Setup: Get Credentials

This script uses the Google Cloud Vertex AI API, which requires a Project ID and an API Key for authentication.

1.  **Find your Project ID:**
    *   Go to the [Google Cloud Console dashboard](https://console.cloud.google.com/home/dashboard).
    *   Your Project ID is listed in the "Project info" card.

2.  **Create an API Key:**
    *   In the Google Cloud Console, navigate to **APIs & Services > Credentials**.
    *   Click **+ CREATE CREDENTIALS** at the top of the page and select **API key**.
    *   Copy the generated API key. It is highly recommended to restrict this key to only be able to access the "Vertex AI API".

3.  You will paste both your Project ID and your API Key into the script's dialog in Photoshop.

## 3. Installation

You only need to copy one file into your Photoshop `Scripts` folder:
1.  `Gemini-Generator.jsx`

Copy the file to the following location, depending on your operating system:

-   **macOS:** `/Applications/Adobe Photoshop [version]/Presets/Scripts/`
-   **Windows:** `C:\Program Files\Adobe\Adobe Photoshop [version]\Presets\Scripts\`

After copying the files, you must **restart Photoshop** for the script to appear in the menu.

## 4. How to Use

1.  Open or create a document in Photoshop.
2.  Go to the `File` menu, then `Scripts`.
3.  Click on `Gemini-Generator` in the list.
4.  The "Gemini Image Generator" dialog will appear.
    -   **First time?** Paste your Google Cloud Project ID and your API Key into the appropriate fields.
    -   Enter your desired image prompt in the text box (e.g., "A beautiful oil painting of a cat in a library").
5.  Click the "**Generate**" button.
6.  The script will contact the Gemini API. After a few moments, a new layer containing the generated image will be added to your document.

## 5. Tip: Assign a Keyboard Shortcut

For faster access, you can assign a custom keyboard shortcut to the script.

1.  Go to `Edit > Keyboard Shortcuts`.
2.  In the `Shortcuts For:` dropdown, select `File`.
3.  Scroll down the list and find `Scripts > Gemini-Generator`.
4.  Click in the shortcut field next to it and press your desired key combination (e.g., `Cmd+Shift+G` or `Ctrl+Shift+G`).
5.  Click `OK` to save.
