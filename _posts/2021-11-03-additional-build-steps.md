---
layout: post
title:  "Catch more errors in your Business Central apps adding steps to your CI/CD pipelines!"
date:   2021-11-03
excerpt: "Catch errors in your Microsoft Dynamics 365 Business Central apps by adding XLIFF Sync's check-step and additional code analysis to your build pipeline in Azure DevOps!"
tag:
- xliff
- translation
- localization
- al
- business central
- code analysis
comments: true
---

Experiencing that you are doing a lot of manual checks in an attempt to catch potential errors in your extensions for Microsoft Dynamics 365 Business Central? In this post you will find some possible additions to your build pipelines that allow you to catch these errors early and completely automized, covering the following categories:

* [Checking XLIFF Translation Files for Errors in Build Pipelines](#checking-xliff-translation-files-for-errors-in-build-pipelines)
  * [Installing the XLIFF Sync PowerShell Module](#installing-the-xliff-sync-powershell-module)
  * [Adding Translation Checks to your BC Build Pipelines](#adding-translation-checks-to-your-bc-build-pipelines)
* [Checking Coverage of your Permission Sets](#checking-coverage-of-your-permission-sets)
* [Adding Custom Code Analyzers to your Pipelines](#adding-custom-code-analyzers-to-your-pipelines)
  * [Custom Code Analyzer in Visual Studio Code](#custom-code-analyzer-in-visual-studio-code)
  * [Custom Code Analyzer in Build Pipelines](#custom-code-analyzer-in-build-pipelines)

## Checking XLIFF Translation Files for Errors in Build Pipelines

Do you want to add, update and check translations for your Microsoft Dynamics 365 Business Central apps efficiently? Then, first up, make sure to read my earlier post ["XLIFF Sync: Time for a complete overview"](https://robvanbekkum.nl/xliff-sync-overview/) on "XLIFF Sync" for VSCode and PowerShell that allows you to synchronize your translation files and check for translation errors.

Now, let's see how we can utilize XLIFF Sync in our build pipelines to catch translation errors early on!

### Installing the XLIFF Sync PowerShell Module

The PowerShell module is available on PowerShell Gallery and can be installed like any other module as follows:

```powershell
Install-Module XliffSync
```

You can also do this on the machine where the agents of your build pipelines are running.

### Adding Translation Checks to your BC Build Pipelines

Starting from version 1.3.0.0, the XLIFF Sync PowerShell module also has a dedicated `Test-BcAppXliffTranslations` command, which runs translation checks as you specify for your Microsoft Dynamics 365 Business Central apps.

Here is an example of how you could invoke this command:

```powershell
Test-BcAppXliffTranslations -translationRulesEnableAll -AzureDevOps 'error' -printProblems
```

which will apply all translation rules/checks, treat issues found as errors, and also print the detected problems.

If you want to, you can also take the source code and use a customized version of the script. Feel free to make a Pull Request if you have any changes that could be useful to others though! 😊

**Test-BcAppXliffTranslations.ps1**

```powershell
<#
 .Synopsis
  Synchronizes and checks translations for a workspace folder with Microsoft Dynamics 365 Business Central apps.
 .Description
  Iterates through the translation units of a base XLIFF file and synchronizes them with a target XLIFF file.
 .Parameter buildProjectFolder
  Specifies the path to the workspace folder containing the projects.
 .Parameter appFolders
  Specifies the names of the app folders in the workspace folder. If empty, all subfolders will be processed.
 .Parameter translationRules
  Specifies which technical validation rules should be used.
 .Parameter translationRulesEnableAll
  Specifies whether to apply all technical validation rules.
 .Parameter restrictErrorsToLanguages
  Specifies languages to restrict errors to. For languages not in the list only warnings will be raised. If empty, then the setting of AzureDevOps applies to all languages.
  .Parameter AzureDevOps
  Specifies whether to generate Azure DevOps Pipeline compatible output. This setting determines the severity of errors.
 .Parameter reportProgress
  Specifies whether the command should report progress.
 .Parameter printProblems
  Specifies whether the command should print all detected problems.
 .Parameter printUnitsWithErrors
  Specifies whether the command should print the units with errors.
#>
function Test-BcAppXliffTranslations {
    Param(
        [Parameter(Mandatory=$false)]
        [string] $buildProjectFolder = $ENV:BUILD_REPOSITORY_LOCALPATH,
        [Parameter(Mandatory=$false)]
        [string[]] $appFolders = @(),
        [Parameter(Mandatory=$false)]
        [ValidateSet("ConsecutiveSpacesConsistent", "ConsecutiveSpacesExist", "OptionMemberCount", "OptionLeadingSpaces", "Placeholders", "PlaceholdersDevNote")]
        [string[]] $translationRules = @("ConsecutiveSpacesConsistent", "OptionMemberCount", "OptionLeadingSpaces", "Placeholders"),
        [switch] $translationRulesEnableAll,
        [Parameter(Mandatory=$false)]
        [string[]] $restrictErrorsToLanguages = @(),
        [Parameter(Mandatory=$false)]
        [ValidateSet('no','error','warning')]
        [string] $AzureDevOps = 'warning',
        [switch] $reportProgress,
        [switch] $printProblems,
        [switch] $printUnitsWithErrors
    )

    if ((-not $appFolders) -or ($appFolders.Length -eq 0)) {
        $appFolders = (Get-ChildItem $buildProjectFolder -Directory).Name
        Write-Host "-appFolders not explicitly set, using subfolders of $($buildProjectFolder): $appFolders"
    }

    Sort-AppFoldersByDependencies -appFolders $appFolders -baseFolder $buildProjectFolder -WarningAction SilentlyContinue | ForEach-Object {
        Write-Host "Checking translations for $_"
        $appProjectFolder = Join-Path $buildProjectFolder $_
        $appTranslationsFolder = Join-Path $appProjectFolder "Translations"
        Write-Host "Retrieving translation files from $appTranslationsFolder"
        $baseXliffFile = Get-ChildItem -Path $appTranslationsFolder -Filter '*.g.xlf'
        Write-Host "Base translation file $($baseXliffFile.FullName)"
        $targetXliffFiles = Get-ChildItem -Path $appTranslationsFolder -Filter '*.xlf' | Where-Object { -not $_.FullName.EndsWith('.g.xlf') }
        $allUnitsWithIssues = @()

        foreach ($targetXliffFile in $targetXliffFiles) {
            [string]$AzureDevOpsSeverityForFile = $AzureDevOps
            if (($AzureDevOps -eq 'error') -and ($restrictErrorsToLanguages.Length -gt 0)) {
                if ($null -eq ($restrictErrorsToLanguages | Where-Object { $targetXliffFile.Name -match $_ })) {
                    $AzureDevOpsSeverityForFile = 'warning'
                }
                Write-Host "Translation error severity is '$AzureDevOpsSeverityForFile' for file $($targetXliffFile.FullName)"
            }

            Write-Host "Syncing to file $($targetXliffFile.FullName)"
            Sync-XliffTranslations -sourcePath $baseXliffFile.FullName -targetPath $targetXliffFile.FullName -AzureDevOps $AzureDevOpsSeverityForFile -reportProgress:$reportProgress -printProblems:$printProblems
            Write-Host "Checking translations in file $($targetXliffFile.FullName)"
            $unitsWithIssues = Test-XliffTranslations -targetPath $targetXliffFile.FullName -checkForMissing -checkForProblems -translationRules $translationRules -translationRulesEnableAll:$translationRulesEnableAll -AzureDevOps $AzureDevOpsSeverityForFile -reportProgress:$reportProgress -printProblems:$printProblems

            if ($unitsWithIssues.Count -gt 0) {
                Write-Host "Issues detected in file $($targetXliffFile.FullName)."
                if ($printUnitsWithErrors) {
                    Write-Host "Units with issues:"
                    Write-Host $unitsWithIssues
                }

                if ($AzureDevOpsSeverityForFile -eq 'error') {
                    $allUnitsWithIssues += $unitsWithIssues
                }
            }
        }

        if ($targetXliffFiles.Count -eq 0) {
            Write-Host "##vso[task.logissue type=warning]There are no target translation files for $($baseXliffFile.Name)"
        }

        if (($AzureDevOps -eq 'error') -and ($allUnitsWithIssues.Count -gt 0)) {
            throw "Issues detected in translation files!"
        }
    }
}
```

What the command does exactly is the following:

* For each app folder (optionally specified by the `-appFolders` parameter, but falling back on all subfolders by default):

    1. Get the `.g.xlf` for the app and use it as the "base" XLIFF file.
    2. Get all other `.xlf` translation files and use them as the "target" XLIFF files.
    3. Synchronize the trans-units from the "base" XLIFF file (`.g.xlf`) to all other XLIFF translation files, so that they get all up-to-date trans-units that are in sync.
    4. Run translation checks as specified by the `-translationRules` parameter or `-translationRulesEnableAll` switch.
    5. If `-AzureDevOps` was set to `'error'` and issues where detected, throw an error.

You can add a step in your build pipelines that invokes the `Test-BcAppXliffTranslations` command after a step compiling your app(s) _with the `TranslationFile` feature enabled_ (which will generate/update the `.g.xlf` for your app(s)).

Please note that as a prerequisite you also need to have the `BcContainerHelper` PowerShell module installed (considering the `Test-BcAppXliffTranslations` command uses the `Sort-AppFoldersByDependencies` command from this module).

## Checking Coverage of your Permission Sets

**Update**: [Stefan Maroń](https://stefanmaron.com/) and I have added an [LC0015](https://github.com/StefanMaron/BusinessCentral.LinterCop/wiki/LC0015) code analyzer rule now that checks permission set coverage as well. You can find this rule in the [Business Central LinterCop](https://github.com/StefanMaron/BusinessCentral.LinterCop).

Next, something you might want to check, is that each AL object is covered by at least one of the permission sets of your app (of course, for those AL object types to which this applies).
Say, someone adds a new AL object, but does not add it to any permission set, so it can never be used unless you have `SUPER` permissions, then this might be something you want to catch in your build pipelines.

The `Test-BcAppPermissionSetCoverage` command below is something which checks exactly that:

**Test-BcAppPermissionSetCoverage.ps1**

```powershell
Param(
    [Parameter(Mandatory=$false)]
    [string] $buildProjectFolder = $ENV:BUILD_REPOSITORY_LOCALPATH,
    [Parameter(Mandatory=$false)]
    [string[]] $appFolders,
    [switch] $allAppFolders,
    [Parameter(Mandatory=$false)]
    [ValidateSet('no','error','warning')]
    [string] $AzureDevOps = 'error'
)

if ($AzureDevOps -eq 'no') {
    return
}

if ((-not $appFolders) -or ($appFolders.Length -eq 0)) {
    Write-Host "-appFolders not explicitly set, using subfolders of $buildProjectFolder"
    $appFolders = (Get-ChildItem $buildProjectFolder -Directory).Name | Where-Object { Test-Path (Join-Path $buildProjectFolder "$_\app.json") }
    if (-not $allAppFolders) {
        $appFolders = $appFolders | Where-Object { $("Test", "RuntimePackages") -notcontains $_ }
    }
    Write-Host "App Folders: $appFolders"
}

Sort-AppFoldersByDependencies -appFolders $appFolders -baseFolder $buildProjectFolder -WarningAction SilentlyContinue | ForEach-Object {
    Write-Host "Checking permission sets for $_"
    $appProjectFolder = Join-Path $buildProjectFolder $_

    $objectTypeHash = @{
        "table" = 1
        "report" = 3
        "codeunit" = 5
        "xmlport" = 6
        "page" = 8
        "query" = 9
    }

    $xmlPermissionSetFileNames = $null
    $permissionSetALDeclarations = $null

    $permissionSetALFiles = Get-ChildItem -Recurse "$appProjectFolder" *.PermissionSet*.al
    $xmlPermissionSetFileNames = (Get-ChildItem $appProjectFolder -Filter "*PermissionSet*.xml").FullName

    if ($permissionSetALFiles -ne $null) {
        if ($xmlPermissionSetFileNames -ne $null) {
            Write-Host "##vso[task.logissue type=warning]Both XML and AL permission sets were found. Please switch to AL permission sets!"
        }

        Write-Host "##[section]Found the following permission set object(s)"
        Write-Host $permissionSetALFiles
        $permissionSetALDeclarations = [ordered]@{}
        foreach ($permissionSetALFile in $permissionSetALFiles) {
            Write-Verbose "Permission set $permissionSetALFile covers the following objects:"
            $permissionSetALFileContent = Get-Content -Path $permissionSetALFile.FullName
            $alObjectsCovered = $permissionSetALFileContent | Select-String "($([string]::Join("|", ($objectTypeHash.GetEnumerator() | ForEach-Object { $_.Key })))) +`"?([A-Za-z0-9_ *]+)`"? =" -AllMatches | ForEach-Object {$_.Matches.Value.Trim(" =")}
            foreach ($alCoveredObject in $alObjectsCovered) {
                Write-Verbose "  [$alCoveredObject]"
                $permissionSetALDeclarations[$alCoveredObject] = $true;
            }
        }
        Write-Host "##[section]The permission set object(s) declare(s) permissions for the following objects"
        Write-Host ($permissionSetALDeclarations.Keys | Format-List | Out-String)
    }
    else {
        if ($xmlPermissionSetFileNames -eq $null) {
            throw "Missing permission set for extension!"
        }
    }

    $alFiles = Get-ChildItem -Recurse "$appProjectFolder" *.al | Where-Object { -not $_.PSIsContainer } | Select-Object Name, FullName, Length
    $missingPermissions = 0

    Write-Host "##[section]Checking coverage for each AL file..."
    foreach ($alFile in $alFiles) {
        Write-Verbose "Searching for objects in $($alFile.Name) that require permissions"
        $alFileContent = Get-Content -Path $alFile.FullName

        # Check if file contains ObsoleteState = Removed;
        if (($alFileContent -match "ObsoleteState = Removed;").Length -gt 0) {
            Write-Verbose "Skipping $($alFile.Name) due to ObsoleteState = Removed"
            continue
        }

        $alObjectDeclarations = $alFileContent -cmatch "^($([string]::Join("|", ($objectTypeHash.GetEnumerator() | ForEach-Object { $_.Key })))) +([0-9]+) +.*$"
        Write-Verbose "$($alObjectDeclarations.Length) object(s) found in $($alFile.Name)"

        foreach ($alObjectDeclaration in $alObjectDeclarations) {
            $hasMatches = $alObjectDeclaration -match "([A-Za-z]+) +([0-9]+) +((`"[A-Za-z0-9_ *]+`")|([A-Za-z0-9_*]+))"
            if (-not $hasMatches) {
                continue
            }
            $objectType = $Matches[1]
            $objectId = $Matches[2]
            $objectName = $Matches[3]
            Write-Verbose "Object Type: [$objectType]; Object ID: [$objectId]; Object name: [$objectName]"

            $foundObjectInPermissionSet = $false
            if ($permissionSetALDeclarations -ne $null) {
                $foundObjectInPermissionSet = ($permissionSetALDeclarations.Contains("$objectType $objectName")) -or
                                              (($permissionSetALDeclarations.Contains(("$objectType $objectName" -replace '"',''))) -or
                                               ($permissionSetALDeclarations.Contains("$objectType *")))
            }
            else {
                foreach ($xmlPermissionSetFileName in $xmlPermissionSetFileNames) {
                    $foundObjectInPermissionSet = Select-Xml -Path "$xmlPermissionSetFileName" -XPath "/PermissionSets/PermissionSet/Permission" | Select-Object -ExpandProperty Node | Where-Object { $_.ObjectType -eq $objectTypeHash.$objectType } | Where-Object { $_.ObjectID -eq $objectId }
                    if ($foundObjectInPermissionSet) {
                        break;
                    }
                }
            }

            if (-not $foundObjectInPermissionSet) {
                Write-Host "##vso[task.logissue type=$AzureDevOps]$objectType $objectId $objectName found in file $($alFile.Name) is missing in permission set(s)."
                $missingPermissions += 1
            }
        }
    }

    Write-Host "##[section]Coverage results:"

    if ($missingPermissions -gt 0) {
        $message = "Missing $missingPermissions objects in permission set(s)!"
        if ($AzureDevOps -eq 'error') {
            throw $message
        }
        else {
            Write-Host $message
        }
    }

    if ($missingPermissions -eq 0) {
        Write-Host "No problems found."
    }

    Write-Host "Done"
}

```

What the command does exactly is the following:

* For each app folder (optionally specified by the `-appFolders` parameter, but falling back on all subfolders by default):

    1. Get all permission sets, either AL- or XML-defined ones.
    2. Check if each AL object (for object types applicable) is covered by one or more of the permission sets.
    3. If `-AzureDevOps` was set to `'error'` and issues where detected, throw an error.

You can add a build step at any point in your pipeline, as long as it's after having loaded the `BcContainerHelper` PowerShell module (due to the `Sort-AppFoldersByDependencies` command from this module being used).

## Adding Custom Code Analyzers to your Pipelines

Do you often find yourself checking for and/or finding the same issues during Pull Request reviews? Then definitely look into adding additional code analyzer rules to your BC build pipelines.
Of course, you can request these rules at the [Dynamics 365 Application Ideas platform (https://aka.ms/bcideas)](https://aka.ms/bcideas), but it might take some time before it gets voted up and makes it into a future update of the [AL Language](https://marketplace.visualstudio.com/items?itemName=ms-dynamics-smb.al) extension.
So, until that happens (and if ever 😅), you can also have a look at using custom code analyzers which do the job for you.
A great example is the [`BusinessCentral.LinterCop`](https://github.com/StefanMaron/BusinessCentral.LinterCop) code analyzer/code-cop by [Stefan Maroń](https://stefanmaron.com/), which is a community effort of adding new useful code analyzer rules for Business Central extensions.
You can view and file requests for new code analyzer rules in the [Discussions](https://github.com/StefanMaron/BusinessCentral.LinterCop/discussions) tab of the GitHub repository, or even contribute with new code analyzer rules yourself by making [Pull Requests](https://github.com/StefanMaron/BusinessCentral.LinterCop/pulls?q=is%3Apr).
This project is also a great example, reference and starting point if you want to make your own code analyzer (which is actually not _that_ difficult, for simple rules), with rules specific to your company.
But, if you happen to have any rules that could be useful to others, then be free to share/integrate them into the `BusinessCentral.LinterCop` for everyone to benefit from it (and make enhancements or bug fixes to it).

### Custom Code Analyzer in Visual Studio Code

First, let's have a look at how you can use a custom code analyzer in Visual Studio Code.
This is actually 'as simple' as taking the `.dll` of your custom code analyzer and placing it in the `bin/Analyzers` folder of the AL Language VSCode extension (i.e., `%USERPROFILE%/.vscode/extensions/ms-dynamics-smb.al-<version>/bin/Analyzers`).

For the `BusinessCentral.LinterCop` however, it's even a lot more easier though.
You can simply install the [BusinessCentral.LinterCop](https://marketplace.visualstudio.com/items?itemName=StefanMaron.businesscentral-lintercop) VSCode extension which will automatically download the latest version of the code analyzer and places it in this folder for you.
Also, see the blog post [BusinessCentral.LinterCop goes VS Code!](https://stefanmaron.com/2021/09/21/businesscentral-lintercop-goes-vs-code/) by [Stefan Maroń](https://stefanmaron.com/) that discusses this in more detail.

After you have set this up, you'll need to enable the code analyzer for your AL project, by adding the following to the `settings.json` file of your project:

**settings.json**

```json
{
    "al.codeAnalyzers": [
        "${AppSourceCop}",
        "${CodeCop}",
        "${UICop}",
        "${analyzerfolder}BusinessCentral.LinterCop.dll"
    ],
    "al.enableCodeAnalysis": true
}
```

You can find all the rules that are currently available in the `BusinessCentral.LinterCop` in the [Rules](https://github.com/StefanMaron/BusinessCentral.LinterCop#rules) section in the README on GitHub.
At the time of writing, the code analyzer has implemented the following rules:

|Id| Title|Default Severity|
|---|---|---|
|LC0001|FlowFields should not be editable.|Warning|
|LC0002|`Commit()` needs a comment to justify its existence. Either a leading or a trailing comment.|Warning|
|LC0003|Do not use an Object ID for properties or variable declarations. |Warning|
|LC0004|`DrillDownPageId` and `LookupPageId` must be filled in table when table is used in list page|Warning|
|LC0005|The casing of variable/method usage must align with the definition|Warning|
|LC0006|Fields with property `AutoIncrement` cannot be used in temporary table (`TableType = Temporary`).|Error|
|LC0007|Every table needs to specify a value for the `DataPerCompany` property. Either `true` or `false`|Disabled|
|LC0008|Filter operators should not be used in `SetRange`.|Warning|
|LC0009|Show info message about code metrics for each function or trigger|Disabled|
|LC0010|Show warning about code metrics for each function or trigger if either cyclomatic complexity is 8 or greater or maintainability index 20 or lower|Warning|
|LC0011|Every object needs to specify a value for the `Access` property. Either `true` or `false`. Optionally this can also be activated for table fields with the setting `enableRule0011ForTableFields`|Disabled|
|LC0012|Using hardcoded IDs in functions like `Codeunit.Run()` is not allowed|Warning|

Some of these rules have the severity set to `Hidden` (Disabled) by default, even though some might be really useful for your development team.
For example, setting the `DataPerCompany` explicitly, could be changed to a `Warning`, which I would recommend, as you are definitely going to regret when you find out your tables have the wrong (implicit) value for this property (talking from experience... 😅).
You can change the severity of these rules, just like for any other rules, by adding them into a `ruleset.json` file, e.g.:

**LinterCop.ruleset.json**

```json
{
    "name": "LinterCop Ruleset",
    "description": "A ruleset to customize severity of LinterCop analyzer rules.",
    "rules": [
        {
            "id": "LC0007",
            "action": "Warning",
            "justification": "DataPerCompany should be set explicitly so that the developer shows that a per-company table is intentional."
        },
        {
            "id": "LC0010",
            "action": "Info",
            "justification": "Cyclomatic complexity and Maintainability index just informational for now."
        },
        {
            "id": "LC0011",
            "action": "Warning",
            "justification": "Access should be set explicitly so that the developer shows that something is part of the public API intentionally."
        }
    ]
}
```

After setting this up and reloading Visual Studio Code, you will get some nice new code analyzer warnings that help you catch errors in your AL project during development of your Business Central AL extension in Visual Studio Code. 😊

![LinterCop VSCode Warning Example](/assets/img/buildSteps/linterCopWarnings.png)

### Custom Code Analyzer in Build Pipelines

If you are building your Business Central AL extensions with the `BcContainerHelper` PowerShell module, then you can use the new `-CustomCodeCops` parameter in the `Compile-AppInBcContainer` command (or `Run-ALPipeline` command) to also apply custom code analyzers in your builds.
For this you need to have the BcContainerHelper version 2.0.16 (or newer) installed and pass the path to the code analyzer DLL to the `-CustomCodeCops` parameter.

Here are some steps to specifically integrate the `BusinessCentral.LinterCop` code analyzer:

1. Add a step that downloads the latest version of the `BusinessCentral.LinterCop` using the GitHub API:

   **Download-BcLinterCop.ps1**

   ```powershell
   Param (
        $targetPath = (Join-Path $ENV:BUILD_REPOSITORY_LOCALPATH '/LinterCop/BusinessCentral.LinterCop.dll')
    )
    $ErrorActionPreference = 'Stop'

    $targetDirectory = Split-Path -Path $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($targetPath) -Parent
    if (-not (Test-Path $targetDirectory)) {
        Write-Host "Creating target directory: $targetDirectory"
        New-Item -ItemType Directory -Path $targetDirectory
    }
    Write-Host "Target directory: $targetDirectory"

    $latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/StefanMaron/BusinessCentral.LinterCop/releases/latest"
    $latestRelease.assets[0].browser_download_url
    $lastVersionTimeStamp = ''
    $lastVersionTimeStamp = Get-Content -Path (Join-Path $PSScriptRoot 'lastversion.txt') -ErrorAction SilentlyContinue

    if ($lastVersionTimeStamp -ne '') {
        $lastVersionTimeStamp = '0001-01-01T00:00:00Z'
    }
    Write-Host "Last version timestamp: $lastVersionTimeStamp"

    if (((Get-Date $lastVersionTimeStamp) -lt (Get-Date $latestRelease.assets[0].updated_at )) -or (-not (Test-Path $targetPath -PathType leaf))) {
        if (Test-Path $targetPath) {
            Remove-Item -Path $targetPath -Force
        }
        Write-Host "Downloading file to $targetPath"
        Invoke-WebRequest -Uri $latestRelease.assets[0].browser_download_url -OutFile $targetPath
        Set-Content -Value $latestRelease.assets[0].updated_at -Path (Join-Path $PSScriptRoot 'lastversion.txt')
        return 1
    }

    return 0
   ```

2. Pass the path to the code-analyzer to the `Compile-AppInBcContainer` or `Run-ALPipeline` command with the `-CustomCodeCops` parameter, e.g.:

    ```powershell
    ...

    [string[]] $customCodeCops = @((Join-Path $ENV:BUILD_REPOSITORY_LOCALPATH '/LinterCop/BusinessCentral.LinterCop.dll'))

    ...

    $appFile = Compile-AppInBCContainer -containerName $containerName `
                                        -credential $credential `
                                        -appProjectFolder $appProjectFolder `
                                        -appSymbolsFolder $buildSymbolsFolder `
                                        -appOutputFolder $appOutputFolder `
                                        -UpdateSymbols:$updateSymbols `
                                        -AzureDevOps `
                                        -EnableCodeCop:$enableCodeCop `
                                        -EnableAppSourceCop:$enableAppSourceCop `
                                        -EnablePerTenantExtensionCop:$enablePerTenantExtensionCop `
                                        -EnableUICop:$enableUICop `
                                        -rulesetFile $ruleSetFilePath `
                                        -CustomCodeCops $customCodeCops

    ...
    ```

   Again, you can also pass a ruleset using the `-ruleSetFile` parameter to change the severity of the rules of the custom code analyzer(s).

And after setting this up, you'll also nicely get the warnings from your custom code analyzer in your build pipelines.
So, from then on, you can check these warnings, which should save you a lot of time in Pull Request reviews, were you would normally check for these things manually. 😊

![LinterCop Pipelines Warning Example](/assets/img/buildSteps/linterCopWarnings_pipelines.png)

## Finally

Hopefully you were able to pick up something from this blog for catching errors in your Business Central extensions early.
If you have any suggestions for other tools that are useful, advices, or ideas for new features, then please feel free to share them!
For requesting new features/enhancements or to report bugs you find, you can open an issue on the [GitHub repository of XLIFF Sync](https://github.com/rvanbekkum/ps-xliff-sync) and [BusinessCentral.LinterCop](https://github.com/StefanMaron/BusinessCentral.LinterCop).

## References

* [BusinessCentral.LinterCop goes VS Code!](https://stefanmaron.com/2021/09/21/businesscentral-lintercop-goes-vs-code/) by [Stefan Maroń](https://stefanmaron.com/)

## Resources

* [BusinessCentral.LinterCop Code Analyzer](https://github.com/StefanMaron/BusinessCentral.LinterCop)
* [BusinessCentral.LinterCop VSCode Extension](https://marketplace.visualstudio.com/items?itemName=StefanMaron.businesscentral-lintercop)
* ["XLIFF Sync" PowerShell Module](https://www.powershellgallery.com/packages/XliffSync/1.3.0.0).
