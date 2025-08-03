# MetadataMaker
**AI-Integrated Metadata Maker Template Series** is a web application designed to generate good-enough quality metadata for unique and non-bibliographic items with AI assistance. It supports export in two formats—MARC and HTML—to accommodate various metadata ingestion systems and content management systems.

## 🔍 How it works

The tool integrates LLM models and API calls to:

* Query various LLM for metadata using ISBN, title, or author
* Use Tesseract.js(OCR) to extract data from clear book cover images
* Auto-generate multilingual and standards-aligned metadata
* Offer an option to save associated images along with metadata

Ideal for cataloging unique or non-standard items with AI assistance, while ensuring human oversight for accuracy and context. The base model template for manual entry of metadata was developed at the University of Illinois, and the AI integration was developed by the Virginia Commonwealth University in Qatar. 

A live version of the tool is available here: https://metadata-maker.pages.dev/


## Editing institution information

By default the records produced by MetadataMaker list the Virginia Commonwealth University in Qatar as the institution that created the records, and Art & Design Library as the location of the physical holding. To change the default institution in code, edit the strings created in **generateInstitutionInfo()** in **metadatamaker/submitForm.js**. The institution information can also be customized by setting certain values in the url. These values largely correspond to the variables in **generateInstitutionInfo()** are:

* **marc** - corresponds to `output['marc']`
* **physicalLocation** - corresponds to `output['mods']['physicalLocation']`
* **recordContentSource** - corresponds to `output['mods']['recordContentSource']`
* **lcn** - organization's LC authority number, used to construct the url in `output['html']['url']`
* **n** - corresponds to `output['html']['name']`

## Browser compatibility

The recommended browsers for MetadataMaker are Chrome and Firefox.

## Updates

**April 21, 2025**

1. Institutional Reference Changes
  • All references to "University of Illinois at Urbana-Champaign" were changed to "Virginia Commonwealth University School of the Arts in Qatar" across multiple files.
  • The MARC code and related placeholders were updated from "UIU" to "VCU".

2. Image Upload and AI Search Features
  • Added image upload functionality with a backend server.
  • Updates to book template
    • Add an image upload section with preview and progress display.
    • Add a button for "Pre-Fetch from AI" and "Search for book with an image" (Using Tesseract.js(OCR) and perplexity api of AI web search)
    • Add a new "Note Field" (synopsis) textarea.
  • JavaScript event listeners were added to handle the new image and AI features.

3. Style Updates
  • `marcmaker.css` was updated to style the new image upload and preview components, as well as the new textarea.

4. JavaScript Updates
  • JavaScript files (`topBar.js`, `submitForm.js`) were updated to reflect the new institution name and MARC code.

**April 22, 2025**

1. The template was updated to handle book synopsis information from a dedicated "synopsis" field to a more general "notes" field, and updates a placeholder to reflect a different institution.

2. Updates to change University information
  The institutional information in both `index.html` and `submitForm.js` was updated.
  • The placeholder and default values for fields like "Physical Location," "Record Content Source," "LC Authority Number," and "Organization's Name" were changed from University of Illinois at Urbana-Champaign (UIU) to Virginia Commonwealth University, Qatar (VCU).
  • In `submitForm.js`, the MARC code, physical location, record content source, LC Authority URL, and organization name were all updated to reflect the new institution.

**April 29, 2025**
- Enhanced Author Name Handling:
 • The form now separates author names into "Family Name" (last name) and "Given Name" (first name) fields.
 • These fields are now required and have improved placeholders
- Title and Author Integration for Search:
 • When searching for book data without an ISBN, the code now combines the title and author name for a more accurate search query.
- User Guidance Improvements:
 • The ISBN field's help text now instructs users to use the title and author fields if an ISBN is not available.
 • A custom alert is added to visually notify users about this guidance when the "Unlisted" checkbox for ISBN is checked.
- UI and Code Cleanups:
 • Some redundant or duplicate author input blocks were removed.
 • Minor code style and event listener improvements for consistency.

**April 29, 2025**
- Updated the system prompt and metadata handling code to always include a "dimensions" field for books, formatted in centimeters.
- Modifies the JavaScript to set and display the "dimensions" value in the form.
- Updates the HTML to ensure the "dimensions" field is present and handled like other metadata fields.
- Adds logic to make certain fields (like author names and subtitle) required and visually indicates missing required fields.

**April 30, 2025**

1. `images/imageUpload.js` 
  • Added a new function to compress images before uploading for OCR, reducing file size and improving performance.
  • Enhanced the AI metadata fetch process:
    • Improved user feedback when neither title nor ISBN is entered (shows a custom alert).
    • Updated the search instructions and sources for fetching book metadata, prioritizing certain sites and requiring citations for each field.
  • Improved handling of image uploads by compressing images and logging original/compressed sizes.

2. `index.html` 
  • Simplified and clarified the navigation menu.
  • Improved the ISBN input block:
    • Added info icons and clearer tooltips.
    • Enhanced the "Unlisted" ISBN alert with a new, more accessible modal.
  • Updated button types for better form handling.
  • Added new custom alert modals for missing input and unlisted ISBN, with improved styling and accessibility.
  • Refactored alert-related JavaScript for modularity and clarity.

3. `marcmaker.css` 
  • Added styles for new alert modals and close buttons.
  • Improved spacing and alignment for author block labels and alert buttons.

**May 26, 2025**

UI/UX Enhancements 
- Added an Instructions button at the top for better user guidance.
- Changed the template name at the top for clearer identification.
- Improved info icon hover (larger icons for title and ISBN fields).
- Added a footer note for extra user context.

Translation & Localization 
- Added fields for transliterated titles and subtitles (for non-English content).
- Auto-detects non-English text and shows transliteration fields as needed.

ISBN & Metadata Integration 
- Improved ISBN mapping for both OCR search and manual input.
- Integrated better ISBN handling into all AI fetch functions.

OCR & Image Processing 
- Supports processing multiple images at once.
- Each image is processed individually via multiple API calls to OCR Space.
- Combines OCR text with manual ISBN/author input for better results.
- Shows real-time progress and end results.
- Now supports video uploads (accepts both images and videos).

AI & Data Fetching 
- Added a separate "Generate Metadata with AI" button.
- Enhanced AI prompts to include transliteration requests.
- Improved error handling with clear success/failure messages.
- Combines OCR and manual input for more accurate metadata.

File Management 
- Removed popup fields for a cleaner image upload interface.
- Streamlined upload process for direct file selection.

**June 2, 2025**

1. Enhanced Image/Video Upload Preview
  • The `images/imageUpload.js` file now supports both image and video file previews.
  • The preview displays an icon and label indicating whether the file is an image, video, or unknown type.
  • Improved error handling and cleanup for object URLs.
  • File names are styled for better readability.

2. Improved Language Detection for Transliteration
  • In `metadatamaker/generalInteractions.js`, the `isNonEnglish` function was improved to better detect non-English text, including French, Spanish, and German.
  • The logic for toggling transliteration fields now uses both non-Roman character detection and the enhanced language detection.

3. UI and Button Text Updates
  • In `index.html`, button labels were updated for clarity and accessibility
  • Instructional text and modal headings were made more consistent and clear.

4. New and Updated CSS Styles
  • New styling added for improved button appearance.
  • Additional styling for info icons and other UI elements.

5. Minor Instructional and Text Fixes
  • Instructional messages and tooltips were clarified for better user guidance.
  • Minor capitalization and formatting fixes in modal instructions.

**June 16, 2025**

- Addition of Equipment Template:
 • Changed the base template to reflect changes with respect to Equipment template.
 • New fields like `item_name`, `serial_number`, and `manufacturer` are added and handled in the form and MARC export.
 • The MARC export logic (`downloadMARC.js`) was updated to include equipment-specific fields, such as a new 024 field for serial numbers and a revised 245 field for item names.
- UI and CSS Enhancements:
 • Substantial updates to CSS files (`marcmaker.css`, `top_bar.css`) for both IMS and LMS, including new styles for file/image previews, modal instructions, and info tooltips.
 • The top bar now references "Virginia Commonwealth University School of the Arts in Qatar" instead of the previous institution.
- Form and Submission Logic:
 • The form submission logic in `submitForm.js` was rewritten to support the new equipment fields and to simplify the record object structure.
- New and Updated Scripts:
 • Added or updated scripts for image upload and preview (`images/imageUpload.js`).
- General Cleanup:
 • Removed unused or obsolete code, such as flexbox CSS for the old layout and subject block styles.
 • Updated placeholders and labels to match the new equipment template.

**June 18, 2025**

- AI Equipment Metadata Generation: 
 The JavaScript logic updated to support fetching and auto-filling equipment/product metadata (like title, manufacturer, serial, dimensions, notes, and product manual link) using an AI service. The new workflow prioritizes equipment data (not just books), and the UI now includes a button to trigger this AI-powered data fetch.
- Product Manual Field Added: 
 The HTML form (`IMS/index.html`) now includes a new input field for a product manual or product site link, allowing users to add URLs to manuals or official product pages.
- MARC/MARCXML Export Updated: 
 The MARC record export logic (`IMS/metadatamaker/downloadMARC.js`) was updated to include the new product manual field in both MARC and MARCXML exports, using field 856 for the manual/specification link.
- Form Submission Logic Updated: 
 The form submission script (`IMS/metadatamaker/submitForm.js`) was updated to include the new product manual field in the record object.

**June 30, 2025**

- Improved error handling for both AI and OCR metadata extraction.
- Added fallback logic when external services fail or return incomplete data.
- Enhanced user feedback and logging for error situations.
- Refactored code to make workflows more robust and reliable.
- Updated UI elements to better handle missing or incorrect information.

**July 7, 2025**

Equipment Template fixes
- Updated default MARC field values for 336, 337, and 338:
 • 336: Changed from "text" to "three-dimensional form"
 • 337: Changed from "unmediated" to "tactile"
 • 338: Changed from "volume" to "three-dimensional object"
- Updated subfield codes accordingly (e.g., b: "txt" → "tdf", "n" → "t", "nc" → "nb")
- Added comments showing the new MARC field examples.
- Changed button text from "AI Generate Equipment Data" to "Generate Equipment Data with AI" and added a class.
- Changed the label "Dimensions" to "Size".
- Removed the "Is this item literature?" and "Does the item include illustrations?" fields and their associated dropdowns and radio buttons.
- Alternative Title Support:
 ○ Added a new "Alternative Title" input block in `IMS/index.html` for users to enter an alternative title.
 ○ Updated form submission (`submitForm.js`) to include the alternative title in the record object.
 ○ Modified MARC and MARCXML export logic (`downloadMARC.js`) to add the alternative title as field 246.
 ○ Updated HTML export (`downloadHTML.js`) to display the alternative title.
- Manufacturer and Country Handling:
 ○ Improved handling and display of manufacturer and country/state/province of manufacture in HTML export.
 ○ Added a comprehensive country code-to-name mapping function.
- Keyword and FAST Handling:
 ○ Refactored how keywords and FAST headings are processed and displayed in the HTML export.
 ○ Simplified and clarified keyword extraction logic in the form submission script.
- Other Enhancements:
 ○ Updated CSS (`marcmaker.css`) for the new alternative title block.
 ○ Improved the structure and clarity of the HTML export, including better handling of notes, product manuals, and other fields.
 ○ Minor bug fixes and code clean-up.
- The function for creating the MARC 008 control field was rewritten.
- The new logic:
 ○ Sets positions 00-05 to the date entered (YYMMDD).
 ○ Marks dates as unknown (positions 06, 07-10, 11-14).
 ○ Handles the place of publication: uses the manufacturer_country if available, otherwise defaults to 'xx'.
 ○ Fills positions 18-34 with 17 backslashes, as required for undefined fields.
 ○ Sets the language code to 'zxx' (no linguistic content).
 ○ Sets position 38 to a backslash (not specified).
 ○ Sets position 39 to 'd' (other cataloging agency).

**July 30, 2025**

- New Feature: Local File Saving
 • Added the ability to save uploaded images and videos directly to a user-selected local folder using the File System Access API (supported in Chrome/Edge 86+).
 • Users are prompted to pick a folder, and files are saved there with progress and success/failure feedback.
 • A popup confirms successful or partial saves, with auto-close and manual close options.
- UI/UX Improvements
 • Enhanced the upload interface in `index.html`:
   • The upload button now triggers the new local saving process.
   • Added persistent status and progress indicators for file saving.
   • Improved preview for both images and videos, including icons and file names.

## Original Version of this Template
This updated version builds on the original and is available on [GitHub](https://github.com/UIUCLibrary/metadata-maker).

## Contact info
For comments and questions, contact Liya Louis ([llouis@vcu.edu](mailto:llouis@vcu.edu)) or Amy J Andres ([ajandres@vcu.edu](mailto:ajandres@vcu.edu)).

