---
layout: post
title:  "Upcoming changes to reporting in Microsoft Dynamics 365 Business Central 20.0"
date:   2022-02-08
excerpt: "Some major changes are about to be made to reporting in Microsoft Dynamics 365 Business Central. Read more to find out how these changes may affect and benefit you."
tag:
- reporting
- al
- business central
comments: true
---

Some major changes are about to be made to reporting in Microsoft Dynamics 365 Business Central with the 2022 wave 1 (20.0) release in April 2022.
Read more to find out how these changes may affect and benefit you. 😊

* [Summarized](#summarized)
* [Details](#details)
  * [Multiple Extension-Provided Layouts](#multiple-extension-provided-layouts)
  * [Excel-Defined Layouts](#excel-defined-layouts)
  * [Custom Renderers](#custom-renderers)

## Summarized

First off, a summary of the changes that are already (publicly) announced:

* Microsoft will move everything related to report rendering to the platform.
* Layouts will be saved in new system tables:
  * Built-in/extension-provided layouts will be saved in `table 2000000231 "Report Layout Definition"`
  * User defined layouts will be saved in `table 2000000232 "Tenant Report Layout"`
* The “Custom Report Layout” table is deprecated in BC20.0 and will then only support “RDLC” and “Word” layouts. Custom layout types will not be supported by the Custom Report Layout table anymore (unless the `EnableReportLegacyWordRender` platform feature switch is enabled, which enables the legacy application document rendering logic (previously used by custom rendering implementations provided by ISVs)).
* There can be multiple extension-provided layouts for a report, added either via a `report` or `reportextension` object.
* It is also possible to have **Custom** type extension-provided layouts for reports.
* There will be a new report selection page. (No details shared yet on what it will look like; not available yet at the time of writing)
* There will be new `OnAfterDocumentReady` and `OnAfterDocumentDownload` events (N.B. this was actually, most likely the trigger to get started on all of these changes). See issue [#11913](https://github.com/microsoft/ALAppExtensions/issues/11913#issuecomment-990821716) on the Microsoft/ALAppExtensions repository.
  * These can be used for archiving purposes or even other scenarios.
* Microsoft will add support for [“Excel” layouts](#excel-defined-layouts).
* ISVs can provide custom renderers for report layouts.
* In the end, the new rendering implementation allows for the following layout types (i.e., the types provided by `Enum "Layout Format"`):
  * RDLC (through the legacy/obsoleted “Custom Report Layout” table or new system tables)
  * Word (through the legacy/obsoleted “Custom Report Layout” table or new system tables)
  * Excel (through the new system tables only)
  * Custom (through the new system tables only)

## Details

### Multiple Extension-Provided Layouts

With the upcoming Business Central release it will be possible to have multiple extension-provided/built-in layouts.

In the `report` object definition or in a `reportextension` object it will be possible to define the layouts that should be shipped with the app(s) that (collectively) define the report object that produces the dataset in a new `rendering` section of the object.
A `reportextension` can add additional layouts for the report, but note that it cannot modify or remove the existing layouts provided by the original `report` object _or_ other `reportextension` objects for the report.

The rendering section for the layout may look something like the following (see also [this Twitter post](https://twitter.com/pborringms/status/1491008277278195712)):

```al
rendering
{
    layout(MySalesInvoiceRDLCLayout)
    {
        Caption = 'My Sales Invoice RDLC Layout';
        LayoutFile = 'mySalesInvoice.rdl';
        Summary = 'My first extension-provided RDLC layout';
        Type = RDLC;
    }

    layout(MySalesInvoiceRDLCLayout)
    {
        Caption = 'Another Sales Invoice RDLC Layout';
        LayoutFile = 'mySalesInvoice2.rdl';
        Summary = 'My second extension-provided RDLC layout';
        Type = RDLC;
    }

    layout(MySalesInvoiceWordLayout)
    {
        Caption = 'My Sales Invoice Word Layout';
        LayoutFile = 'mySalesInvoice.docx';
        Summary = 'My first extension-provided Word layout';
        Type = Word;
    }

    layout(MySalesInvoiceExcelLayout)
    {
        Caption = 'My Sales Invoice Excel Layout';
        LayoutFile = 'mySalesInvoice.xlsx';
        Summary = 'My first extension-provided Excel layout';
        Type = Excel;
    }

    layout(MySalesInvoiceDocumentCreatorLayout)
    {
        Caption = 'My Sales Invoice Document Creator Layout';
        LayoutFile = 'mySalesInvoice.dcrx';
        MimeType = 'application/xml';
        Summary = 'My first extension-provided Document Creator layout';
        Type = Custom;
    }
}
```

So, here you can provide a list of layouts that should be published to (or unpublished from) the new system tables together with the app that contains the report or reportextension.
As you can see, this also supports:

1. Layouts of the same type (e.g., 2 RDLC layouts)
2. The new **Excel** layout type.
3. **Custom** layout types, which need to define the additional `MimeType` property.

But, next to having extension-provided layouts it is also still possible to have user-defined layouts next to these extension-provided/built-in layouts (similar to how that could be done with the (now deprecated) Custom Report Layout page/table).

### Excel-Defined Layouts

With the upcoming Business Central release it will be possible to set up report layouts in Excel.
This layout type is specifically targeted at reports that do not need to be printed, but allow you to take advantage of all features that Excel has to offer to interact with the data provided by the report, such as sliders, diagrams, charts, pivot tables, PowerQuery and so forth.
With multiple tabs it is possible to present the user with different ways of interacting with the data provided by the report.

![Excel Layout Sample](https://pbs.twimg.com/media/FK_9-WOWQAAQR16?format=jpg&name=large)

See also the following [Twitter post](https://twitter.com/MSDYN365BC/status/1490689907827875842) that provides an example of what running reports with an Excel layout might look like.

Find more information on this new feature in the release plan notes: [Use Excel to design layouts for reports](https://docs.microsoft.com/en-us/dynamics365-release-plan/2022wave1/smb/dynamics365-business-central/users-use-excel-design-layouts-reports)

### Custom Renderers

ISVs will officially be able to implement renderers for custom layout types using the new `ReportManagement.OnCustomDocumentMerger` event.
This event replaces the (now obsoleted) `ReportManagement.OnMergeDocumentReport` and `"Document Report Mgt.".OnBeforeMergeDocument` events that could previously be used to 'piggyback' on the legacy report renderer that was (partially) defined in the AL application code to define a custom renderer.
The old events will not be triggered anymore, unless the `EnableReportLegacyWordRender` platform feature switch is enabled again on the Business Central service tier (only possible for on-premise deployments).
The new `OnCustomDocumentMerger` event will on the other hand be triggered when reports are run using a **Custom**-type layout selection.
