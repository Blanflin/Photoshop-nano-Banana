#target photoshop

// json2.js
// 2023-05-10
// Public Domain.
if (typeof JSON !== "object") {
    JSON = {};
}
(function () {
    "use strict";
    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    function f(n) {
        return (n < 10) ? "0" + n : n;
    }
    function this_value() {
        return this.valueOf();
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function () {
            return isFinite(this.valueOf()) ? (
                this.getUTCFullYear() +
                "-" +
                f(this.getUTCMonth() + 1) +
                "-" +
                f(this.getUTCDate()) +
                "T" +
                f(this.getUTCHours()) +
                ":" +
                f(this.getUTCMinutes()) +
                ":" +
                f(this.getUTCSeconds()) +
                "Z"
            ) : null;
        };
        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }
    var gap;
    var indent;
    var meta;
    var rep;
    function quote(string) {
        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string) ?
            "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string" ?
                    c :
                    "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\"" :
            "\"" + string + "\"";
    }
    function str(key, holder) {
        var i;
        var k;
        var v;
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];
        if (
            value &&
            typeof value === "object" &&
            typeof value.toJSON === "function"
        ) {
            value = value.toJSON(key);
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case "string":
                return quote(value);
            case "number":
                return (isFinite(value)) ? String(value) : "null";
            case "boolean":
            case "null":
                return String(value);
            case "object":
                if (!value) {
                    return "null";
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }
                    v = partial.length === 0 ?
                        "[]" :
                        gap ?
                        ("[\n" +
                            gap +
                            partial.join(",\n" + gap) +
                            "\n" +
                            mind +
                            "]") :
                        "[" + partial.join(",") + "]";
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    (gap) ?
                                    ": " :
                                    ":"
                                ) + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    (gap) ?
                                    ": " :
                                    ":"
                                ) + v);
                            }
                        }
                    }
                }
                v = partial.length === 0 ?
                    "{}" :
                    gap ?
                    "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" :
                    "{" + partial.join(",") + "}";
                gap = mind;
                return v;
        }
    }
    if (typeof JSON.stringify !== "function") {
        meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }
            } else if (typeof space === "string") {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (
                    typeof replacer !== "object" ||
                    typeof replacer.length !== "number"
                )) {
                throw new Error("JSON.stringify");
            }
            return str("", {
                "": value
            });
        };
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return (
                        "\\u" +
                        ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                    );
                });
            }
            if (
                rx_one.test(
                    text
                    .replace(rx_two, "@")
                    .replace(rx_three, "]")
                    .replace(rx_four, "")
                )
            ) {
                j = eval("(" + text + ")");
                return (typeof reviver === "function") ?
                    walk({
                        "": j
                    }, "") :
                    j;
            }
            throw new SyntaxError("JSON.parse");
        };
    }
}());

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

    // --- Globals ---
    var settings = loadSettings();

    // --- UI Definition ---
    var dialog = new Window("dialog", SCRIPT_NAME);
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];

    // API Key Panel
    var apiPanel = dialog.add("panel", undefined, "API Configuration");
    apiPanel.orientation = "column";
    apiPanel.alignChildren = ["fill", "top"];
    apiPanel.margins = 15;

    var projectIDGroup = apiPanel.add("group", undefined);
    projectIDGroup.orientation = "row";
    projectIDGroup.add("statictext", undefined, "Google Cloud Project ID:");
    var projectIDInput = projectIDGroup.add("edittext", [0, 0, 255, 20], settings.projectID || "");

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
    var gPromptText, gProjectID;

    // Generate Button
    generateButton.onClick = function() {
        gPromptText = promptInput.text;
        gProjectID = projectIDInput.text;

        if (!gProjectID) {
            alert("Please enter your Google Cloud Project ID.");
            return;
        }

        if (!gPromptText) {
            alert("Please enter a prompt.");
            return;
        }

        saveSettings({ projectID: gProjectID });

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
        // 1. Get Access Token
        var progress = new Window("palette", "Authenticating...");
        progress.add("statictext", undefined, "Getting access token via gcloud...");
        progress.show();

        var tempTokenFile = new File(Folder.temp + "/gemini_token_" + Date.now() + ".txt");
        var gcloudCommand = 'gcloud auth application-default print-access-token > "' + tempTokenFile.fsName + '"';
        app.system(gcloudCommand);

        if (!tempTokenFile.exists) {
            alert("Error: gcloud command failed to create token file. Make sure the Google Cloud SDK is installed and authenticated correctly.");
            progress.close();
            return;
        }

        tempTokenFile.open('r');
        var gAccessToken = tempTokenFile.read();
        tempTokenFile.close();
        tempTokenFile.remove();

        if (!gAccessToken || gAccessToken.length < 20) {
            alert("Failed to get access token. The token file was created but empty or invalid. Make sure you have run 'gcloud auth application-default login' in your terminal.");
            progress.close();
            return;
        }

        progress.children[0].text = "Authentication successful. Preparing image...";
        progress.close(); // Close it for now, will re-open for API call

        var doc = app.activeDocument;
        app.preferences.rulerUnits = Units.PIXELS;

        var selectionBounds;
        var baseImageBase64 = null;
        var maskImageBase64 = null;
        var selectionChannel = null;

        try {
            selectionBounds = doc.selection.bounds;
        } catch (e) {
            // No selection, continue with text-to-image
        }

        if (selectionBounds) {
            // --- In-painting Workflow ---
            // Save the selection on the original document so we can use it for masking later
            selectionChannel = doc.channels.add();
            doc.selection.store(selectionChannel);

            // 1. Create Base Image
            var baseImageDoc = doc.duplicate("TempBaseImage", true);
            app.activeDocument = baseImageDoc;
            var originalWidth = baseImageDoc.width;
            var originalHeight = baseImageDoc.height;
            var wasResized = false;
            var scaleFactor = 1;

            var maxWidth = 1024;
            var maxHeight = 1024;
            if (baseImageDoc.width.as('px') > maxWidth || baseImageDoc.height.as('px') > maxHeight) {
                if (baseImageDoc.width > baseImageDoc.height) {
                    scaleFactor = maxWidth / originalWidth.as('px');
                    baseImageDoc.resizeImage(UnitValue(maxWidth, "px"), null, null, ResampleMethod.BICUBIC);
                } else {
                    scaleFactor = maxHeight / originalHeight.as('px');
                    baseImageDoc.resizeImage(null, UnitValue(maxHeight, "px"), null, ResampleMethod.BICUBIC);
                }
                wasResized = true;
            }
            baseImageDoc.flatten();
            var tempPngFile = new File(Folder.temp + "/gemini_base_" + Date.now() + ".png");
            var pngSaveOptions = new PNGSaveOptions();
            baseImageDoc.saveAs(tempPngFile, pngSaveOptions, true, Extension.LOWERCASE);
            tempPngFile.open('r');
            tempPngFile.encoding = 'BINARY';
            baseImageBase64 = base64.fromByteArray(tempPngFile.read());
            tempPngFile.close();
            tempPngFile.remove();

            // 2. Create Mask Image
            var maskDoc = app.documents.add(baseImageDoc.width, baseImageDoc.height, baseImageDoc.resolution, "TempMask", NewDocumentMode.RGB);
            app.activeDocument = maskDoc;

            // Fill with black
            var black = new SolidColor();
            black.rgb.hexValue = "000000";
            maskDoc.artLayers.add();
            maskDoc.selection.selectAll();
            maskDoc.selection.fill(black);
            maskDoc.selection.deselect();

            // Load the saved selection and fill with white
            maskDoc.selection.load(selectionChannel);
            if (wasResized) {
                maskDoc.selection.resize(scaleFactor * 100, scaleFactor * 100, AnchorPosition.MIDDLECENTER);
            }
            var white = new SolidColor();
            white.rgb.hexValue = "FFFFFF";
            maskDoc.selection.fill(white);
            maskDoc.selection.deselect();

            var tempMaskFile = new File(Folder.temp + "/gemini_mask_" + Date.now() + ".png");
            maskDoc.saveAs(tempMaskFile, pngSaveOptions, true, Extension.LOWERCASE);
            tempMaskFile.open('r');
            tempMaskFile.encoding = 'BINARY';
            maskImageBase64 = base64.fromByteArray(tempMaskFile.read());
            tempMaskFile.close();
            tempMaskFile.remove();

            // 3. Clean up temp documents and restore focus
            baseImageDoc.close(SaveOptions.DONOTSAVECHANGES);
            maskDoc.close(SaveOptions.DONOTSAVECHANGES);
            app.activeDocument = doc;

            // We keep selectionChannel on the main doc to use for masking the final result
        }

        // --- API Call ---
        var progress = new Window("palette", "Generating...");
        progress.add("statictext", undefined, "Contacting Gemini API...");
        progress.show();

        var tempResponseFile = new File(Folder.temp + "/gemini_response_" + Date.now() + ".json");

        var API_ENDPOINT = "https://us-central1-aiplatform.googleapis.com/v1/projects/" + gProjectID + "/locations/us-central1/publishers/google/models/imagegeneration@006:predict";

        var jsonPayload;
        if (baseImageBase64 && maskImageBase64) {
            // In-painting payload
            jsonPayload = {
                "instances": [{
                    "prompt": gPromptText,
                    "image": { "bytesBase64Encoded": baseImageBase64 },
                    "mask": { "bytesBase64Encoded": maskImageBase64 }
                }],
                "parameters": {
                    "editMode": "inpainting-insert",
                    "sampleCount": 1
                }
            };
        } else {
            // Text-to-image payload
            jsonPayload = {
                "instances": [{
                    "prompt": gPromptText
                }],
                "parameters": {
                    "sampleCount": 1
                }
            };
        }

        var tempPayloadFile = new File(Folder.temp + "/gemini_payload_" + Date.now() + ".json");
        tempPayloadFile.open("w");
        tempPayloadFile.write(JSON.stringify(jsonPayload));
        tempPayloadFile.close();

        var command = 'curl -s -i -X POST' + // Use -i to include headers in output
            ' -H "Authorization: Bearer ' + gAccessToken + '"' +
            ' -H "Content-Type: application/json; charset=utf-8"' +
            ' "' + API_ENDPOINT + '"' +
            ' -d @' + '"' + tempPayloadFile.fsName + '"' +
            ' > "' + tempResponseFile.fsName + '"';

        // Execute the command
        app.system(command);
        tempPayloadFile.remove();

        // Process the response
        try {
            tempResponseFile.open("r");
            var fullResponse = tempResponseFile.read();
            tempResponseFile.close();
            tempResponseFile.remove();

            if (fullResponse.length === 0) {
                throw new Error("API request failed. The response was empty. This could be due to a curl error or network issue.");
            }

            // Separate headers and body
            var headerEndPosition = fullResponse.indexOf("\r\n\r\n");
            if (headerEndPosition === -1) {
                throw new Error("Invalid API response. Could not find HTTP headers. Response: " + fullResponse);
            }
            var headerText = fullResponse.substring(0, headerEndPosition);
            var bodyText = fullResponse.substring(headerEndPosition + 4);

            // Check status code from headers
            var statusLine = headerText.split("\r\n")[0];
            if (statusLine.indexOf("200 OK") === -1) {
                throw new Error("API returned an error:\n" + statusLine + "\n\n" + bodyText);
            }

            var response = JSON.parse(bodyText);

            if (response.predictions && response.predictions.length > 0) {
                progress.children[0].text = "Processing image data...";
                var b64String = response.predictions[0].bytesBase64Encoded;

                if (b64String) {
                    var tempImageFile = new File(Folder.temp + "/gemini_image_" + Date.now() + ".png");
                    var decodedData = base64.toByteArray(b64String);

                    tempImageFile.encoding = "BINARY";
                    tempImageFile.open("w");
                    tempImageFile.write(decodedData);
                    tempImageFile.close();

                    var placedItem = app.open(tempImageFile);

                    // Duplicate the layer to the original document
                    var newLayer = placedItem.artLayers[0].duplicate(doc, ElementPlacement.PLACEATBEGINNING);
                    newLayer.name = "Gemini: " + gPromptText.substring(0, 20);

                    placedItem.close(SaveOptions.DONOTSAVECHANGES);
                    app.activeDocument = doc; // Explicitly set focus back to original document

                    // If we had a selection, position and mask the new layer
                    if (selectionBounds) {
                        // If we downscaled the image for the API, scale it back up to fit the original selection.
                        if (wasResized) {
                            newLayer.resize(originalWidth, originalHeight, ResampleMethod.BICUBIC);
                        }

                        // Move the new layer to the selection's original position
                        var deltaX = selectionBounds[0].as('px') - newLayer.bounds[0].as('px');
                        var deltaY = selectionBounds[1].as('px') - newLayer.bounds[1].as('px');
                        newLayer.translate(deltaX, deltaY);

                        // Restore the original selection and apply it as a mask
                        doc.selection.load(selectionChannel);
                        app.activeDocument.activeLayer = newLayer;
                        app.activeDocument.addLayerMask();
                        selectionChannel.remove(); // Clean up the channel
                    }
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
