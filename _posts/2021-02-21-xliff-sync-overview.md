---
layout: post
title:  "XLIFF Sync: Time for a complete overview"
date:   2021-02-21
excerpt: "Just getting started with translations for your application, or curious on how you could work more efficiently in translating your applications? Read more about how to work more efficiently on translating your applications with XLIFF translation files."
tag:
- xliff
- translation
- localization
- al
- business central
comments: true
---

Just getting started with translations for your application, or curious on how you could work more efficiently in translating your applications?
This blog is written for all developers that look to translate their applications with XLIFF translation files.
Enjoy and hopefully you will be able to pick up some things that make you work more efficiently by leveraging features from the ["XLIFF Sync"](https://marketplace.visualstudio.com/items?itemName=rvanbekkum.xliff-sync) extension for Visual Studio Code!

* [What is XLIFF?](#what-is-xliff)
* [How is XLIFF used to localize/translate applications?](#how-is-xliff-used-to-localizetranslate-applications)
* [What is the problem?](#what-is-the-problem)
* [How can XLIFF Sync help me to work more efficiently with translation files?](#how-can-xliff-sync-help-me-to-work-more-efficiently-with-translation-files)
  * [Create New Target Files](#create-new-target-files)
  * [Synchronize Translation Files](#synchronize-translation-files)
  * [Check Translation Files](#check-translation-files)
  * [Parse from Developer Note](#parse-from-developer-note)
  * [Import Translations from Files](#import-translations-from-files)
  * [Extensive Customization Options](#extensive-customization-options)
* [What's New](#whats-new)
  * [Define Equivalent Languages](#define-equivalent-languages)
  * [Faster Implementation (Improved Time Complexity)](#faster-implementation-improved-time-complexity)
  * [Various](#various)
* [XLIFF Sync PowerShell Module](#xliff-sync-powershell-module)
  * [Continuous Integration](#continuous-integration)
* [Finally](#finally)
* [Resources](#resources)
* [References](#references)

## What is XLIFF?

XLIFF, short for **XML Localization Interchange File Format**, is an XML-based file format with the `.xlf` file extension that allows for localizing/translating your applications.

An XLIFF file contains the translations for the localizable data (e.g., captions, labels, tooltips, messages) of your application for a target language.
It typically contains a list of entries ('units') with a source and translation text.

Here is an example of the contents of an XLIFF file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2 xliff-core-1.2-transitional.xsd">
  <file datatype="xml" source-language="en-US" target-language="nl-NL" original="Document Archive">
    <body>
      <group id="body">
        <trans-unit id="Codeunit 3479148982 - Method 4098204879 - NamedType 3282233832" size-unit="char" translate="yes" xml:space="preserve">
          <source>You do not have %1 permissions for category %2.</source>
          <target state="translated">U heeft geen "%1"-machtigingen voor categorie %2.</target>
          <note from="Developer" annotates="general" priority="2">%1 = Permission Type; %2 = Category</note>
          <note from="Xliff Generator" annotates="general" priority="3">Codeunit WSB_DCAPermissionMgt - Method CheckPermissions - NamedType NoPermissionsForCategoryErr</note>
        </trans-unit>
        <trans-unit id="Page 231583499 - Action 328308815 - Method 1377591017 - NamedType 2879608585" size-unit="char" translate="yes" xml:space="preserve">
          <source>Sites refreshed successfully!</source>
          <target state="translated">Sites succesvol ververst!</target>
          <note from="Developer" annotates="general" priority="2"/>
          <note from="Xliff Generator" annotates="general" priority="3">Page WSB_DCASharePointSetup - Action RefreshSites - Method OnAction - NamedType SitesRefreshedSuccessfullyMsg</note>
        </trans-unit>
        ...
```

At the top of the file, in the `file`-node, we can see that the language of the original/source text is `en-US`, an RFC 4646 language tag short for "English (United States)", while the language for the translation/target text is `nl-NL`, "Dutch (Netherlands)".
In the snippet we see 2 entries ('units') each with a `source`-node that contains the text that should be translated and a `target`-node that contains the translation for the target language.

Further, we can have notes with additional information about each entry which can be helpful during translation.
In our snippet, the first entry has a "Developer" note, which in this case specifies the substitutions for the "%1" and "%2" placeholders so that this can be taken into account during the translation.
For both entries we see an "Xliff Generator" note, which in this case contains a note that is automatically generated by the compiler to provide some details on where this translation will be used, e.g., for the second entry we see that this is a message that is shown when the "RefreshSites" action is invoked by a user.

## How is XLIFF used to localize/translate applications?

During/after development one can use an XLIFF Generator to extract localizable data from source code and generate an XLIFF file.
For example, for Angular this can be done with the `ng xi18n`/`ng extract-i18n` commandline tool (see [Angular i18n: Performing translations with built-in module](https://lokalise.com/blog/angular-i18n/)). However, for the rest of this blog I would like to focus on localization/translation of Microsoft Dynamics 365 Business Central apps.

For Microsoft Dynamics 365 Business Central apps/extensions an XLIFF file can be generated by enabling the `"TranslationFile"` feature for your app (see [Working with Translation Files](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-work-with-translation-files#generating-the-xliff-file)).
If you enable this feature and build your app, then the [AL Language](https://marketplace.visualstudio.com/items?itemName=ms-dynamics-smb.al) Extension (or, actually the AL Language Compiler (`alc`)) will generate an XLIFF file for the app and places it in a subfolder of your project called **Translations** with file name `<My App Name>.g.xlf`.

![GenerateXliff](/assets/img/xliffSync/generateXliff.gif)

{% capture withzerobalance %}
/assets/img/xliffSync/generatedXliffFile.png
{% endcapture %}
{% include gallery images=withzerobalance caption="A Generated base XLIFF file" cols=1 %}

The XLIFF file that is generated only contains the original, non-translated text for all the captions, labels, tooltips and messages in your app.

**My App Name.g.xlf**

```xml
<?xml version="1.0" encoding="utf-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2 xliff-core-1.2-transitional.xsd">
  <file datatype="xml" source-language="en-US" target-language="en-US" original="My App Name">
    <body>
      <group id="body">
        <trans-unit id="PageExtension 1255613137 - Method 716454850 - NamedType 3515139347" size-unit="char" translate="yes" xml:space="preserve" al-object-target="PageExtension 1255613137">
          <source>Hello World!</source>
          <note from="Developer" annotates="general" priority="2"></note>
          <note from="Xliff Generator" annotates="general" priority="3">PageExtension CustomerListExt - Method OnOpenPage - NamedType HelloWorldMsg</note>
        </trans-unit>
      </group>
    </body>
  </file>
</xliff>
```

To start translating, you make a copy of this file, set the target language of the new file and rename the file accordingly.
So, for example, if you want to add translations for the language "Dutch (Netherlands)" (`nl-NL`), then you make a copy of the `.g.xlf` file, change the target-language, rename the file accordingly and add the translations to the file:

**My App Name.nl-NL.xlf**

```xml
<?xml version="1.0" encoding="utf-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2 xliff-core-1.2-transitional.xsd">
  <file datatype="xml" source-language="en-US" target-language="nl-NL" original="My App Name">
    <body>
      <group id="body">
        <trans-unit id="PageExtension 1255613137 - Method 716454850 - NamedType 3515139347" size-unit="char" translate="yes" xml:space="preserve" al-object-target="PageExtension 1255613137">
          <source>Hello World!</source>
          <target state="translated">Hallo wereld!</target>
          <note from="Developer" annotates="general" priority="2"></note>
          <note from="Xliff Generator" annotates="general" priority="3">PageExtension CustomerListExt - Method OnOpenPage - NamedType HelloWorldMsg</note>
        </trans-unit>
      </group>
    </body>
  </file>
</xliff>
```

You can copy the file and update the target-language manually, or just a bit easier and quicker by using the **"XLIFF: Create New Target File(s)"** command from the command palette (Ctrl + Shift + P) in VSCode (see [Create New Target Files](#create-new-target-files)).

For editing the XLIFF file and adding your translations, rather than editing the `.xlf` via a text editor/with VS Code, it is better to use a dedicated editor.
A great and intuitive tool for this is [Poedit](https://poedit.net/).
There is a nice blog about this tool by [Jeremy Vyska](https://jeremy.vyska.info/author/jvyska) that shows you the great features it offers, such as the Translation Memory feature: [Massively Speed MSDYN365BC Translations using (free) Poedit](https://jeremy.vyska.info/2020/08/massively-speed-msdyn365bc-translations-using-free-poedit/1968). You can also check out the blog [How to Translate Copied Reports](https://navinsights.net/2020/11/17/how-to-translate-copied-reports/) by [Waldemar Brakowski](https://navinsights.net/author/wbrakowski/) which will cover this as well.
Of course, there are plenty of alternatives and other tools available to help you with editing `.xlf` files, so feel free to explore these yourself as well and share your thoughts on what you might already be using yourself.

After entering the translations in the target translation file(s), it is simply a matter of recompiling your app and the translations will then be included!
It's as simple as that! 😃

Or well, there is one problem...

## What is the problem?

As you are adding more and more captions, labels, tooltips and messages to your app(s) in each update, updating the XLIFF files and keeping them in sync with the automatically generated `.g.xlf` file becomes quite a challenge!
Keeping all the files in sync is undoable, or at the very least, time-consuming and unnecessary labour.
IDs might change, the source text of entries might change and you want to catch any errors that might be made as early as possible.

## How can XLIFF Sync help me to work more efficiently with translation files?

The ["XLIFF Sync"](https://marketplace.visualstudio.com/items?itemName=rvanbekkum.xliff-sync) extension for Visual Studio Code can help you work more efficiently with XLIFF translation files in various ways.
Let's go through this step by step, beginning with features you may want to use when you are just getting started with translating your app(s).

* [Create New Target Files](#create-new-target-files)
* [Synchronize Translation Files](#synchronize-translation-files)
* [Check Translation Files](#check-translation-files)
* [Parse from Developer Note](#parse-from-developer-note)
* [Import Translations from Files](#import-translations-from-files)
* [Extensive Customization Options](#extensive-customization-options)

### Create New Target Files

Let's start simple: say you have your base XLIFF file from your XLIFF Generator, e.g., the `.g.xlf` file from the AL Language compiler, and so your project folder only contains the base file:

![Base XLIFF File Only](/assets/img/xliffSync/baseFileOnly.png)

Then, the next step is to create the (initial) new files for the translations for your target languages.
For this, you can use the **"XLIFF: Create New Target File(s)"** command, which you can invoke via the command palette (Ctrl + Shift + P) in VSCode:

![Create New Target File(s)](/assets/img/xliffSync/createNewTargetFiles.png)

Select your workspace folder (i.e., if you have a multi-root workspace then you will see all project folders here):

![Select Workspace Folder](/assets/img/xliffSync/selectWorkspaceFolder.png)

Select the target language to create a new translation file for (i.e., if you first select "Select multiple..." you can generate files for multiple languages at once):

![Select Target Language](/assets/img/xliffSync/selectNewTargetLanguage.png)

Then, as a result, a new XLIFF file will have been created for the selected target language from the base XLIFF file:

![New Target File Created](/assets/img/xliffSync/newTargetFileCreated.png)

Now you can add translations for the language by opening the newly created XLIFF file.
You can also open it in your default XLIFF editor, e.g., Poedit, by choosing **Open Externally...**:

![Open Externally from Explorer](/assets/img/xliffSync/openExternallyFileExplorer.png)

![Edit in Poedit](/assets/img/xliffSync/editInPoedit.png)

Now we have an initial file for the target language, but what if you add new captions, labels, tooltips or messages to your app?
In that case, if you rebuild the app the base (`.g.xlf`) XLIFF file will have been updated with new entries by the XLIFF Generator.
Of course, we need to get these new entries in the target file(s) as well so that we can translate these new entries as well.

### Synchronize Translation Files

The base XLIFF file gets new entries every time you add new labels and rebuild your app.
To get these new entries into your app you can use the command **XLIFF: Synchronize Translation Units**.
This command will synchronize the base XLIFF file with _all_ the other XLIFF files in the open workspace (folder).

![Synchronize Translation Units (Command Palette)](/assets/img/xliffSync/synchronizeTranslationUnitsPalette.png)

This command can also be invoked by opening the context menu on the base XLIFF file from the explorer and choosing **Synchronize Translation Units**:

![Synchronize Translation Units (Explorer)](/assets/img/xliffSync/synchronizeTranslationUnitsExplorer.png)

This updates all the other XLIFF files so that they will all have the exact same units as the base XLIFF file.

If the ID of a unit changed, then the sync. will try to match units of base and target files based on other properties of the units, i.e.:

> [Usage](https://github.com/rvanbekkum/vsc-xliff-sync#usage)
> 
> The extension will try to find corresponding trans-units and translations within an existing file as follows:
> 
> 1. Finding trans-units:
> > 1. By Id
> > 2. By XLIFF Generator Note & Source (enabled by default, configurable with `xliffSync.findByXliffGeneratorNoteAndSource`)
> > 3. By XLIFF Generator Note & Developer Note (enabled by default, configurable with `xliffSync.findByXliffGeneratorAndDeveloperNote`)
> > 4. By XLIFF Generator Note (enabled by default, configurable with `xliffSync.findByXliffGeneratorNote`)
> 
> 2. Finding translations:
> > 5. By Source & Developer Note (disabled by default, configurable with `xliffSync.findBySourceAndDeveloperNote`)
> > 6. By Source (disabled by default, configurable with `xliffSync.findBySource`)
> 
> 3. Initial translation:
> > 7. Parse from Developer Note (disabled by default, configurable with `xliffSync.parseFromDeveloperNote`)
> > 8. Copy from Source, if applicable/configured for target language (disabled by default, configurable with `xliffSync.copyFromSourceFor...`)
> 
> If no trans-unit or translation is found, the unit is added and its target node is tagged with `state="needs-translation"`.

In the overview you can see that the extension first (1.) tries to find a matching trans-unit, then if no matching unit can be found it will be considered as a new unit but (2.) tries to add translations that are already present for units with the same source text (if enabled and found), and otherwise finally (3.) tries to fill in an initial translation by [parsing it from the developer note](#parse-from-developer-note) (if enabled) or copy it from the source text if that is applicable/configured for the target language.

If the source text of a unit happens to have changed (e.g., you as developer changed the caption of a field in the source code), then the target's state will be updated to `needs-adaptation` and an **"XLIFF Sync"** note will be added to indicate that this change was detected:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2 xliff-core-1.2-transitional.xsd">
  <file datatype="xml" source-language="en-US" target-language="nl-NL" original="My App Name">
    <body>
      <group id="body">
        <trans-unit id="PageExtension 1255613137 - Method 716454850 - NamedType 3515139347" size-unit="char" translate="yes" xml:space="preserve" al-object-target="PageExtension 1255613137">
          <source>Hello World?</source>
          <target state="needs-adaptation">Hallo wereld!</target>
          <note from="XLIFF Sync" annotates="general" priority="1">Source text has changed. Please review the translation.</note>
          <note from="Developer" annotates="general" priority="2"/>
          <note from="Xliff Generator" annotates="general" priority="3">PageExtension CustomerListExt - Method OnOpenPage - NamedType HelloWorldMsg</note>
        </trans-unit>
      </group>
    </body>
  </file>
</xliff>
```

If you update the translation in your XLIFF editor and synchronize again, the **"XLIFF Sync"** note will be removed automatically.

If you wish, this behaviour can be completely disabled by setting `xliffSync.detectSourceTextChanges` to `false`, or, if you only want to stop the **"XLIFF Sync"** note from being added, then you can set `xliffSync.addNeedsWorkTranslationNote` to `false`.

### Check Translation Files

As you are adding translations for your app, you want to catch errors in the translations as early as possible.
To facilitate this, XLIFF Sync contributes two commands:

* **XLIFF: Check for Missing Translations**

  ![Check for Missing Translations](/assets/img/xliffSync/checkForMissingTranslations.png)

  This command will check all XLIFF translation files for missing translations and notify you whether or not any were found.
  If found that one or more of your translation files has missing translations, you will get a notification for each file that has missing translations.
  You also have the option to open files with missing translations with your default XLIFF file editor using the **Open Externally** button from the informational message.

  ![Missing Translations Notifications](/assets/img/xliffSync/missingTranslationsNotification.png)

  If no missing translations are found in any of your files, you will be notified about this as well:

  ![No Missing Translations Found](/assets/img/xliffSync/noMissingTranslationsFound.png)

* **XLIFF: Check for Need Work Translations**

  ![Check for Need Work Translations](/assets/img/xliffSync/checkForNeedWorkTranslations.png)

  This command will check all XLIFF translation files for translations that need work, i.e., translations that contain problems.
  If found that one or more of your translation files has translations that need work, you will get a notification for each file that includes the faulty translations.
  You also have the option to open files with translations that need work with your default XLIFF file editor using the **Open Externally** button from the informational message.

  ![Need Work Translations Notifications](/assets/img/xliffSync/needWorkTranslationsNotification.png)

  The target node of the trans-units containing problems will be tagged with `state="needs-adaptation"`. Additionally, a `note` will be added to the trans-unit to explain which problem was detected:

  ```xml
  <trans-unit id="PageExtension 1255613137 - Method 3728534107 - NamedType 2495679301" size-unit="char" translate="yes" xml:space="preserve" al-object-target="PageExtension 1255613137">
    <source>Customer %1 has %2 invoices</source>
    <target state="needs-adaptation">Deze klant heeft %1 facturen.</target>
    <note from="XLIFF Sync" annotates="general" priority="1">Problem detected: The number of placeholders in the source and translation text do not match.</note>
    <note from="Developer" annotates="general" priority="2">%1 = Customer Name; %2 = Invoice Count</note>
    <note from="Xliff Generator" annotates="general" priority="3">PageExtension CustomerListExt - Method ShowInvoiceCount - NamedType InvoiceCountMsg</note>
  </trans-unit>
  ```

  You will also see these notes if you open the XLIFF file in your default XLIFF file editor, e.g., in Poedit:

  {% capture withzerobalance %}
  /assets/img/xliffSync/needWorkPoedit.png
  /assets/img/xliffSync/poeditSorting.png
  /assets/img/xliffSync/needWorkPoedit_2_updated.png
  {% endcapture %}
  {% include gallery images=withzerobalance caption="Need Work Translations in Poedit" cols=3 %}

  (_Tip:_ You can change the sorting in Poedit via the **View** menu, to sort on source text and have missing translations and translations that need work first.)

  Once you corrected the translation and run the **XLIFF: Check for Need Work Translations** command again, the **"XLIFF Sync"** note will be removed automatically:

  ```xml
  <trans-unit id="PageExtension 1255613137 - Method 3728534107 - NamedType 2495679301" size-unit="char" translate="yes" xml:space="preserve" al-object-target="PageExtension 1255613137">
    <source>Customer %1 has %2 invoices</source>
    <target state="translated">Klant %1 heeft %2 facturen.</target>
    <note from="Developer" annotates="general" priority="2">%1 = Customer Name; %2 = Invoice Count</note>
    <note from="Xliff Generator" annotates="general" priority="3">PageExtension CustomerListExt - Method ShowInvoiceCount - NamedType InvoiceCountMsg</note>
  </trans-unit>
  ```

  (**Note:** If you want to stop the **"XLIFF Sync"** note from being added alltogether, then you can set `xliffSync.addNeedsWorkTranslationNote` to `false`.)

  You can configure the checks that need to be run with the `xliffSync.needWorkTranslationRules` setting.
  The currently implemented technical validation rules are the following:

  | Rule ID               | Check                                                                                                     | Trigger                                                                                    | Example                                                                                                            |
  |-----------------------|-----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
  | `ConsecutiveSpacesConsistent` | 'Consecutive space'-occurrences are not matching. | N.A. | The source text includes 3 consecutive spaces, the translation text includes 2 consecutive spaces. |
  | `ConsecutiveSpacesExist` | Source or translation text contain consecutive spaces. | N.A. | The source text includes 2 consecutive spaces, e.g., <pre>Hello  World</pre> |
  | `OptionMemberCount`   | Number of options in caption are not matching.                                                            | Xliff Generator note with `Property OptionCaption` or `Property PromotedActionCategories`. | The source text includes 3 options, `A,B,C` , but the translation text includes 4 options, `A,B,C,D`.              |
  | `OptionLeadingSpaces` | Number of leading spaces in options are not matching.                                                     | Xliff Generator note with `Property OptionCaption` or `Property PromotedActionCategories`. | The source text includes a space, `A, B` , but the translation text does not, `A,B`.                               |
  | `Placeholders`        | Placeholders of source and translation are not matching.                                                  | Source/Translation text includes placeholders of the form `{0}` or `%1` or `#1`.                   | The source text includes placeholders `%1 %2` , but the translation text only includes `%1`.                       |
  | `PlaceholdersDevNote`        | Placeholders are not explained in the Developer note.                                                  | Source text includes placeholders of the form `{0}` or `%1` or `#1`.                   | The source text includes placeholders `%1 %2` , but the Developer note is empty and so does not contain the placeholders.                       |
  | `SourceEqualsTarget`  | Source and translation are not the same, even though source-language = target-language for the .xlf file. | The source-language is the same as the target-language for the .xlf file.                  | The source text is 'A', but the translation text is 'B'. The source-language and target-language are both 'en-US'. |

If you want these checks to be run automatically every time after you synchronize your XLIFF translation files, then you can set the `xliffSync.autoCheckMissingTranslations` and/or `xliffSync.autoCheckNeedWorkTranslations` settings to `true`.

### Parse from Developer Note

An approach that is taken by some app developers is to have the _initial_ translation provided by the developers themselves (that is, for languages that they are proficient in, typically their mother tongue).
This can be done by adding translations as a developer note/comment in the source code:

```pascal
procedure MyProcedure()
var
    DissapointDaveErr: Label 'I am afraid I can not do that, Dave', Comment = 'en-US=I am trepidacious I can not do that, Dave|nl-NL=Ik ben bang dat ik dat niet kan doen, Dave';
    ExtremeMathMsg: Label 'One plus one = two', Comment = 'en-US=One plus one = TWO|nl-NL=Een plus een is twee|nl-BE=Een plus een is twee';
    SatisfySamMsg: Label 'I hope you are satisfied, Sam', Comment = 'This is just a regular comment';
    TerminateTimErr: Label 'Hasta la vista, Tim', Comment = 'nl-BE=Salut, Tim';
    WorshipWillemMsg: Label 'Thank you Willem';
begin
    Error(DissapointDaveErr);
end;
```

If you want to utilize this, the "XLIFF Sync" extension for Visual Studio code can help you to automatically get the translations provided by the developer in the comments to your target XLIFF translation files.
To let "XLIFF Sync" extract/parse translations from the Developer notes, you will need to set the `xliffSync.parseFromDeveloperNote` setting to `true`.
If you synchronize with this setting enabled, then the translations will be parsed from the Developer notes and added to the translation units in your target translation files.

On top of that, you can also enable snippets that help you adding captions, labels and tooltips with translation comments in your AL source code.
For this, you can set the `xliffSync.enableSnippetsForLanguages` setting to `["al"]` and set `xliffSync.snippetTargetLanguage` to your preferred language, e.g.:

```json
{
    "xliffSync.enableSnippetsForLanguages": ["al"],
    "xliffSync.snippetTargetLanguage": "nl-NL"
}
```

You can then use snippets `tcaptionwithtranslation`, `tcommentwithtranslation`, `toptioncaptionwithtranslation`, `tpromotedactioncategorieswithtranslation`, `tlabelwithtranslation` and `ttooltipwithtranslation` to add translations in comments in your AL source code as follows:

![AL Language Parse from Dev. Note Snippets](/assets/img/xliffSync/alParseFromDevNoteSnippet.gif)

For an extensive example, you can also check GitHub issue [#37](https://github.com/rvanbekkum/vsc-xliff-sync/issues/37) "[Feature Request] Parsing Target from Comment".

### Import Translations from Files

You can import translations from external XLIFF files using the **XLIFF: Import Translations from File(s)** command.
This command will open a file dialog in which you can select one or more XLIFF files.

![Import Translations from Files](/assets/img/xliffSync/importTranslationsFromFiles.png)

![Import Translations from Files (Dialog)](/assets/img/xliffSync/importTranslationsFromFilesDialog.png)

The command will copy translations from the selected files to trans-units in the XLIFF files in your project folder with the same target-language for matching sources.
It will first try to merge translations for trans-units with a matching combination of **source-text** and **Developer note**, and only after that try to merge translations to trans-units with matching source-text.
That way you could utilize the Developer note to have the import perform a more precise merge of the translations (e.g., based on tags in the Developer notes).

Please note that the import is only based on the source-text and Developer note, so be aware of when/how you use this command!

Another good alternative of reusing translations is to leverage the **Translation Memory** feature in Poedit.
As noted earlier, there is already a nice blog by [Jeremy Vyska](https://jeremy.vyska.info/author/jvyska) which shows you how you can use it: [Massively Speed MSDYN365BC Translations using (free) Poedit](https://jeremy.vyska.info/2020/08/massively-speed-msdyn365bc-translations-using-free-poedit/1968)

### Extensive Customization Options

There are a lot of customization options in the "XLIFF Sync" extension for Visual Studio Code.
Here are some examples:

* First off, the default settings for the extension are tailored to development for Microsoft Dynamics 365 Business Central apps/extensions in the AL Language.
  The XLIFF Generator included in the AL compiler generates XLIFF files with a **Developer** and **Xliff Generator** note.
  Other XLIFF Generator, like Angular's `ng xi18n`/`ng extract-i18n` might be adding different notes, such as a **meaning** and **description** note.
  You can use the `xliffSync.xliffGeneratorNoteDesignation` and `xliffSync.developerNoteDesignation` settings to configure how XLIFF Sync will utilize notes to match translation units for translation files with different notes.
* You can specify which languages should be considered as equivalents using the `xliffSync.equivalentLanguages` and `xliffSync.equivalentLanguagesEnabled` settings. This way you only need to enter the translations for one language and they will be copied to the translation files of equivalent languages automatically when you synchronize again.

  See [Define Equivalent Languages](#define-equivalent-languages) for more information.
* If you are working with a multi-root workspace with a main app and one or more translation apps, then you can set the `xliffSync.syncCrossWorkspaceFolders` to `true` so that trans-units will be synced to XLIFF files over all project folders.
* You can change what happens when the source text of units changed. You could completely disable them from being marked for review by setting `xliffSync.detectSourceTextChanges` to `false` (not recommended), or could you specify that the existing translation should be cleared by setting `xliffSync.clearTranslationAfterSourceTextChange` to `true`.
* By default, XLIFF Sync opens your translation files in Visual Studio Code editors. If you don't want them to be open you can set `xliffSync.keepEditorOpenAfterSync` to `false`.

Please see the [Settings](https://github.com/rvanbekkum/vsc-xliff-sync#settings) section in the [README](https://github.com/rvanbekkum/vsc-xliff-sync) for a complete overview of the available settings.

## What's New?

A new version of XLIFF Sync has just been released, which adds some very useful features and enhancements.
Please see the [Changelog](https://marketplace.visualstudio.com/items/rvanbekkum.xliff-sync/changelog) for an overview of all the changes that have been added in updates of the extension.

### Define Equivalent Languages

New settings `xliffSync.equivalentLanguages` and `xliffSync.equivalentLanguagesEnabled` that can be used to specify equivalent languages. You can specify pairs of master language and slave language-pattern (RegEx) in the `xliffSync.equivalentLanguages` setting to have the extension copy to contents of the master language's translation file to the translation files of its slave languages. This way you only need to enter the translations for the master language, so that after you sync. again the slave languages will get the same translations, and you don't need to go through all languages files that would get the same translations. For example, _often_ `nl-NL` and `nl-BE` would simply get the same translations, so this way you could specify that `nl-BE` should take over all the translations of `nl-NL`. (GitHub issue [#74](https://github.com/rvanbekkum/vsc-xliff-sync/issues/74))

* The default value for `xliffSync.equivalentLanguagesEnabled` is `false`.
* The default value for `xliffSync.equivalentLanguages` is

    ```json
    {
      "de-DE": "de-.*",
      "en-US": "en-.*",
      "es-ES": "es-.*",
      "fr-FR": "fr-.*",
      "nl-NL": "nl-.*"
    }
    ```

    You can freely customize this, e.g., adding `"en-GB"` as a master language for `"(en-AU)|(en-NZ)"` and changing `"en-US"` to be a master language for `"en-CA"` if you do have differences between `en-US` and `en-GB` in your translations:

    ```json
    {
      "de-DE": "de-.*",
      "en-GB": "(en-AU)|(en-NZ)",
      "en-US": "en-CA",
      "es-ES": "es-.*",
      "fr-FR": "fr-.*",
      "nl-NL": "nl-.*"
    }
    ```

### Faster Implementation (Improved Time Complexity)

Optimized syncing through a preprocessing step that builds unit maps. The existing implementation approaches \\(\mathcal{O}(n^2)\\) while this optimization implemented brings it down to \\(\mathcal{O}(n)\\) (with n being the number of translation units). This optimization was already applied earlier in the PowerShell version (see [ps-xliff-sync](https://github.com/rvanbekkum/ps-xliff-sync)). The new setting `xliffSync.unitMaps` can be used to change whether and to which extent these maps should be used (**Default**: `"All"`). (GitHub issue [#31](https://github.com/rvanbekkum/vsc-xliff-sync/issues/31))

### Various

* New setting `xliffSync.preserveTargetChildNodes` that can be used to specify whether child nodes specific to the translation target file should be preserved while syncing. Currently this setting will preserve `alt-trans` nodes and custom nodes for XLIFF 1.2 files. (**Default**: `false`) (GitHub issue [#60](https://github.com/rvanbekkum/vsc-xliff-sync/issues/60))
* The extension can now handle units with child nodes (e.g., placeholder tags like `<x/>`) in the target node. (GitHub issue [#67](https://github.com/rvanbekkum/vsc-xliff-sync/issues/67))
* New setting `xliffSync.keepEditorOpenAfterSync` that can be used to specify whether XLIFF files should be open in the editor after syncing. (**Default**: `true`)
* The technical validation rules now also check that placeholders of the form `#1` match. (GitHub issue [#73](https://github.com/rvanbekkum/vsc-xliff-sync/issues/73))

## XLIFF Sync PowerShell Module

Recently, there is also a PowerShell version of XLIFF Sync.
You can use this in your build pipeline to detect problems in the translation, and also even to extract your custom translation units from a code-customized Base Application.

### Continuous Integration

You can add a task to your (Azure DevOps) build pipeline that uses the [XLIFF Sync PowerShell module](https://github.com/rvanbekkum/ps-xliff-sync) to check for missing translations and problems in the translations.

The function below gives an example:

**Check-AppTranslations.ps1**
```powershell
Param(
    [Parameter(Mandatory=$false)]
    [string] $buildProjectFolder = $ENV:BUILD_REPOSITORY_LOCALPATH,
    [Parameter(Mandatory=$true)]
    [string[]] $appFolders,
    [string[]] $translationRules = @("ConsecutiveSpacesConsistent", "OptionMemberCount", "OptionLeadingSpaces", "Placeholders"),
    [switch] $translationRulesEnableAll,
    [ValidateSet('no','error','warning')]
    [string] $AzureDevOps = 'warning'
)

Sort-AppFoldersByDependencies -appFolders $appFolders -baseFolder $buildProjectFolder -WarningAction SilentlyContinue | ForEach-Object {
    Write-Host "Checking translations for $_"
    $appProjectFolder = Join-Path $buildProjectFolder $_
    $appTranslationsFolder = Join-Path $appProjectFolder "Translations"
    Write-Host "Retrieving translation files from $appTranslationsFolder"
    $baseXliffFile = Get-ChildItem -Path $appTranslationsFolder -Filter '*.g.xlf'
    Write-Host "Base translation file $($baseXliffFile.FullName)"
    $targetXliffFiles = Get-ChildItem -Path $appTranslationsFolder -Filter '*.xlf' | Where-Object { -not $_.FullName.EndsWith('.g.xlf') }

    foreach ($targetXliffFile in $targetXliffFiles) {
        Write-Host "Syncing to file $($targetXliffFile.FullName)"
        Sync-XliffTranslations -sourcePath $baseXliffFile.FullName -targetPath $targetXliffFile.FullName -AzureDevOps $AzureDevOps -reportProgress -printProblems
        Write-Host "Checking translations in file $($targetXliffFile.FullName)"
        Check-XliffTranslations -targetPath $targetXliffFile.FullName -checkForMissing -checkForProblems -translationRules $translationRules -translationRulesEnableAll:$translationRulesEnableAll -AzureDevOps $AzureDevOps -reportProgress -printProblems
    }
}
```

For each target translation file, the translation units are first synced with the base file using the `Sync-XliffTranslations` command.
Then, as the next step, it checks the target translation file for missing translations and problems using the `Check-XliffTranslations` command.
If any issues are found they are printed in Azure DevOps pipeline-compatible format such that they will be perceived as warnings in your pipeline runs.

![Pipeline Warnings](/assets/img/xliffSync/pipelineWarnings.png)

This way if a developer adds or changes captions, labels and/or tooltips but no translations, you will see from the pipeline runs that it's time to do some translation work! 📙

## Finally

Hopefully you were able to pick up something from this blog to start working more efficiently in translating your apps.
If you have any suggestions for other tools that are useful, advices, or ideas for new features, then please feel free to share them!
For requesting new features/enhancements or to report bugs you find, you can open an issue on the [GitHub repository of XLIFF Sync](https://github.com/rvanbekkum/vsc-xliff-sync).

## Resources

* ["XLIFF Sync"](https://marketplace.visualstudio.com/items?itemName=rvanbekkum.xliff-sync) extension for Visual Studio Code
* ["XLIFF Sync"](https://github.com/rvanbekkum/ps-xliff-sync) PowerShell module.
* [Poedit](https://poedit.net/) open-source translation file editor

## References

* [Massively Speed MSDYN365BC Translations using (free) Poedit](https://jeremy.vyska.info/2020/08/massively-speed-msdyn365bc-translations-using-free-poedit/1968) by [Jeremy Vyska](https://jeremy.vyska.info/author/jvyska)
* [How to Translate Copied Reports](https://navinsights.net/2020/11/17/how-to-translate-copied-reports/) by [Waldemar Brakowski](https://navinsights.net/author/wbrakowski/)
