#target photoshop

// --- Base64 Library ---
// Adapted from base64-js by @beatgammit
var base64 = (function() {
    var exports = {};
    'use strict'

    exports.byteLength = byteLength
    exports.toByteArray = toByteArray
    exports.fromByteArray = fromByteArray

    var lookup = []
    var revLookup = []
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i]
        revLookup[code.charCodeAt(i)] = i
    }

    revLookup['-'.charCodeAt(0)] = 62
    revLookup['_'.charCodeAt(0)] = 63

    function getLens(b64) {
        var len = b64.length
        if (len % 4 > 0) {
            throw new Error('Invalid string. Length must be a multiple of 4')
        }
        var validLen = b64.indexOf('=')
        if (validLen === -1) validLen = len
        var placeHoldersLen = validLen === len ?
            0 :
            4 - (validLen % 4)
        return [validLen, placeHoldersLen]
    }

    function byteLength(b64) {
        var lens = getLens(b64)
        var validLen = lens[0]
        var placeHoldersLen = lens[1]
        return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
    }

    function _byteLength(b64, validLen, placeHoldersLen) {
        return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
    }

    function toByteArray(b64) {
        var tmp
        var lens = getLens(b64)
        var validLen = lens[0]
        var placeHoldersLen = lens[1]
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))
        var curByte = 0
        var len = placeHoldersLen > 0 ?
            validLen - 4 :
            validLen
        var i
        for (i = 0; i < len; i += 4) {
            tmp =
                (revLookup[b64.charCodeAt(i)] << 18) |
                (revLookup[b64.charCodeAt(i + 1)] << 12) |
                (revLookup[b64.charCodeAt(i + 2)] << 6) |
                revLookup[b64.charCodeAt(i + 3)]
            arr[curByte++] = (tmp >> 16) & 0xFF
            arr[curByte++] = (tmp >> 8) & 0xFF
            arr[curByte++] = tmp & 0xFF
        }
        if (placeHoldersLen === 2) {
            tmp =
                (revLookup[b64.charCodeAt(i)] << 2) |
                (revLookup[b64.charCodeAt(i + 1)] >> 4)
            arr[curByte++] = tmp & 0xFF
        }
        if (placeHoldersLen === 1) {
            tmp =
                (revLookup[b64.charCodeAt(i)] << 10) |
                (revLookup[b64.charCodeAt(i + 1)] << 4) |
                (revLookup[b64.charCodeAt(i + 2)] >> 2)
            arr[curByte++] = (tmp >> 8) & 0xFF
            arr[curByte++] = tmp & 0xFF
        }
        return arr
    }

    function tripletToBase64(num) {
        return lookup[num >> 18 & 0x3F] +
            lookup[num >> 12 & 0x3F] +
            lookup[num >> 6 & 0x3F] +
            lookup[num & 0x3F]
    }

    function encodeChunk(uint8, start, end) {
        var tmp
        var output = []
        for (var i = start; i < end; i += 3) {
            tmp =
                ((uint8[i] << 16) & 0xFF0000) +
                ((uint8[i + 1] << 8) & 0xFF00) +
                (uint8[i + 2] & 0xFF)
            output.push(tripletToBase64(tmp))
        }
        return output.join('')
    }

    function fromByteArray(uint8) {
        var tmp
        var len = uint8.length
        var extraBytes = len % 3
        var parts = []
        var maxChunkLength = 16383
        for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
            parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
        }
        if (extraBytes === 1) {
            tmp = uint8[len - 1]
            parts.push(
                lookup[tmp >> 2] +
                lookup[(tmp << 4) & 0x3F] +
                '=='
            )
        } else if (extraBytes === 2) {
            tmp = (uint8[len - 2] << 8) + uint8[len - 1]
            parts.push(
                lookup[tmp >> 10] +
                lookup[(tmp >> 4) & 0x3F] +
                lookup[(tmp << 2) & 0x3F] +
                '='
            )
        }
        return parts.join('')
    }

    return exports;
})();


// Main function to run the script
function main() {
    // --- Configuration ---
    var SCRIPT_NAME = "Gemini Image Generator";
    var SETTINGS_FILE = new File(Folder.userData + "/gemini_photoshop_settings.json");
    var API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent";

    // --- Globals ---
    var settings = loadSettings();

    // --- UI Definition ---
    var dialog = new Window("dialog", SCRIPT_NAME);
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];

    // API Key Panel
    var apiKeyPanel = dialog.add("panel", undefined, "API Configuration");
    apiKeyPanel.orientation = "column";
    apiKeyPanel.alignChildren = ["fill", "top"];
    apiKeyPanel.margins = 15;
    var apiKeyGroup = apiKeyPanel.add("group", undefined);
    apiKeyGroup.orientation = "row";
    apiKeyGroup.add("statictext", undefined, "Gemini API Key:");
    var apiKeyInput = apiKeyGroup.add("edittext", [0, 0, 300, 20], settings.apiKey || "", { password: true });

    // Prompt Panel
    var promptPanel = dialog.add("panel", undefined, "Image Prompt");
    promptPanel.orientation = "column";
    promptPanel.alignChildren = ["fill", "top"];
    promptPanel.margins = 15;
    var promptInput = promptPanel.add("edittext", [0, 0, 400, 100], "A photorealistic image of...", { multiline: true, scrolling: true });
    promptInput.active = true; // Set focus to the prompt input

    // Buttons Group
    var buttonsGroup = dialog.add("group", undefined);
    buttonsGroup.orientation = "row";
    buttonsGroup.alignment = ["right", "bottom"];
    var cancelButton = buttonsGroup.add("button", undefined, "Cancel");
    var generateButton = buttonsGroup.add("button", undefined, "Generate", { name: "ok" });

    // --- UI Logic ---

    // Cancel Button
    cancelButton.onClick = function() {
        dialog.close();
    };

    // --- Global variables for passing to suspendHistory ---
    var gApiKey;
    var gPromptText;

    // Generate Button
    generateButton.onClick = function() {
        gApiKey = apiKeyInput.text;
        gPromptText = promptInput.text;

        if (!gApiKey) {
            alert("Please enter your Gemini API Key.");
            return;
        }

        if (!gPromptText) {
            alert("Please enter a prompt.");
            return;
        }

        saveSettings({ apiKey: gApiKey });

        dialog.close();

        try {
            if (app.documents.length === 0) {
                alert("Please open a document before running the script.");
                return;
            }
            app.activeDocument.suspendHistory("Gemini Image Generation", "generateImage()");
        } catch (e) {
            alert("Error: " + (e.message ? e.message : e));
        }
    };

    // This function is called by suspendHistory and uses the global variables
    function generateImage() {
        var originalDoc = app.activeDocument;
        app.preferences.rulerUnits = Units.PIXELS;

        var progress = new Window("palette", "Generating...");
        progress.add("statictext", undefined, "Contacting Gemini API via curl...");
        progress.show();

        var tempResponseFile = new File(Folder.temp + "/gemini_response_" + Date.now() + ".json");

        // Escape the prompt text for the JSON payload
        var escapedPrompt = gPromptText.replace(/"/g, '\\"').replace(/\n/g, '\\n');

        // Construct the JSON payload string
        var jsonPayload = '{"contents":[{"parts":[{"text":"' + escapedPrompt + '"}]}]}';

        // Construct the curl command
        var command = 'curl -s -X POST "' + API_ENDPOINT + '"' +
            ' -H "Content-Type: application/json"' +
            ' -H "x-goog-api-key: ' + gApiKey + '"' +
            ' -d ' + "'" + jsonPayload + "'" +
            ' > "' + tempResponseFile.fsName + '"';

        // Execute the command
        app.system(command);

        // Process the response
        try {
            tempResponseFile.open("r");
            var responseText = tempResponseFile.read();
            tempResponseFile.close();
            tempResponseFile.remove();

            if (responseText.length === 0) {
                throw new Error("API request failed. The response was empty. This could be due to a curl error or network issue.");
            }

            var response = JSON.parse(responseText);

            if (response.candidates && response.candidates.length > 0) {
                progress.children[0].text = "Processing image data...";
                var b64String = response.candidates[0].content.parts[0].inlineData.data;

                if (b64String) {
                    var tempImageFile = new File(Folder.temp + "/gemini_image_" + Date.now() + ".png");
                    var decodedData = base64.toByteArray(b64String);

                    tempImageFile.encoding = "BINARY";
                    tempImageFile.open("w");
                    tempImageFile.write(decodedData);
                    tempImageFile.close();

                    var placedItem = app.open(tempImageFile);
                    var newLayer = placedItem.artLayers[0].duplicate(originalDoc);
                    newLayer.name = "Gemini: " + gPromptText.substring(0, 20);
                    placedItem.close(SaveOptions.DONOTSAVECHANGES);
                    tempImageFile.remove();

                    progress.close();
                    alert("Image generated successfully!");
                } else {
                    throw new Error("No image data found in API response.");
                }
            } else {
                 var errorMessage = response.error ? response.error.message : "No candidates found in response.";
                 throw new Error(errorMessage);
            }
        } catch (e) {
            progress.close();
            alert("An error occurred: " + e);
        }
    }


    // --- Helper Functions ---

    function loadSettings() {
        if (SETTINGS_FILE.exists) {
            try {
                SETTINGS_FILE.open("r");
                var content = SETTINGS_FILE.read();
                SETTINGS_FILE.close();
                return JSON.parse(content);
            } catch (e) {
                // Could be corrupted, return default
                return {};
            }
        }
        return {}; // No settings file yet
    }

    function saveSettings(newSettings) {
        try {
            SETTINGS_FILE.open("w");
            SETTINGS_FILE.write(JSON.stringify(newSettings));
            SETTINGS_FILE.close();
        } catch (e) {
            alert("Error saving settings: " + e.toString());
        }
    }

    // --- Display the Dialog ---
    dialog.show();
}

// Run the main function
// It's good practice to wrap the script in a try-catch block
try {
    main();
} catch (e) {
    alert("An unexpected error occurred: " + e.toString());
}
