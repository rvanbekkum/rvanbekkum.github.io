---
layout: post
title:  "Business Central Desktop/Taskbar Icons for a DTAP Environment Pipeline"
date:   2022-05-23
excerpt: "Apply colored desktop/taskbar icons to more easily distinguish between environments to open."
tag:
- business central
- client
comments: true
---

As you might know, you can have multiple environments for your Business Central online or on-premise deployment.
These can be **Production** (by default, for BC online, you can have 1) or **Sandbox** environments (by default, for BC online, you can have up to 3).

In our company (N.B. being a Microsoft partner supporting multiple customers), we have a convention to have 4 environments for each Business Central customer, both for BC online and on-premise customers.
These concern environments following the **DTAP** paradigm, which gives us an environment for:

1. **Development** - Where our developers do development and testing (even though we also do development using Docker containers)
2. **Test** - Where our ERP consultants do testing
3. **Acceptance** - Where end-customer users do testing
4. **Production** - Where end-customer does his actual business in

A straightforward and convenient pipeline for testing new releases of Business Central, ISV- and PTE-apps in stages.
And note that with this "DTAP" paradigm, the environments in the first three environment types are _Sandbox_ environments, while the environments in the last environment type are _Production_ environments.

However, a small annoyance (at least for me personally) when working with multiple customers is that once every while, I take a second to (1) know which desktop shortcut to use, and also (2) which environment (type) I am currently working in.

* [Business Central Desktop Icons per Environment Type](#business-central-desktop-icons-per-environment-type)
* [Custom Taskbar Icons per Environment Type](#custom-taskbar-icons-per-environment-type)
  * [Dynamics NAV and Early BC Releases](#dynamics-nav-and-early-bc-releases)
  * [Latest BC Releases](#latest-bc-releases)
* [Conclusion](#conclusion)

## Business Central Desktop Icons per Environment Type

To address this issue, I have created a set of Business Central desktop icons, one for each environment type as used in the **DTAP** paradigm.
The desktop icons each have a distinctive color (traffic light colors! 😜) and 3-letter code to signify the environment type:

1. **Development** - Red color, "DEV" as 3-letter code
2. **Test** - Yellow, "TST" as 3-letter code
3. **Acceptance** - Green, "ACP" as 3-letter code
4. **Production** - Blue, "PRD" as 3-letter code

In the figure below you see an example of these icons used for 4 different Business Central environments, one for each environment type in the DTAP paradigm.

![environmentIconsSample](/assets/img/environmentIcons/desktop-icons-sample-2.png)

You can download these icons by clicking the **Download** button below:

[![download-icons](/assets/img/environmentIcons/download-button.png)](/assets/downloads/bc_environment_icons.zip)

Then, the first way, to use these icons is by applying them to your desktop shortcuts, i.e.:

1. Open the **Properties** of your desktop shortcut (from the context-menu you can open with the right-mouse button)
2. In the **Shortcut** tab, choose **Change Icon...**
3. Browse and select the **.ico** file you need and choose **OK**.

## Custom Taskbar Icons per Environment Type

Now, you might be thinking/asking: "As soon as I open BC from the desktop shortcut, I will see the default BC icon again in my taskbar. Is it possible to change the taskbar icon as well?".
It would be really helpful to see which environment you are working in by looking at the icon in the taskbar!

And the answer to the question of whether this is possible is: "_It depends_".

### Dynamics NAV and Early BC Releases

For Business Central 14.x web client (and older), it is possible to do this.
Open the web client in Microsoft Edge (or Google Chrome), and then select the **Apps | Install this site as an app** option.

![install-this-site-as-an-app](/assets/img/environmentIcons/install-this-site-as-an-app.png)

After clicking on this option, you will get the option to choose a custom app name and change the app icon.
You can change the app icon by clicking on **Edit** which allows you to choose an **.ico** or **.png** image for your app.

![install-app-change-icon](/assets/img/environmentIcons/install-app-change-icon.png)

If you create an app/shortcut for the app this way, you will also have the custom BC icon on your taskbar while working in Business Central! 😊

![taskbar-icon-bc-tst](/assets/img/environmentIcons/taskbar-icon-bc-tst.png)

### Latest BC Releases

With the latest versions of Business Central, Microsoft Edge only allows you to install BC as **Progressive Web App (PWA)**.
Unfortunately, when you install BC as a **PWA** in Edge or Chrome you do not get the option to choose a custom icon that should be used when you use the app.

Hopefully, this will become an option in the future, or maybe someone knows a way to achieve this, which I was not able to find. 😉

## Conclusion

I hope the information and the downloadable icons in this post might be helpful to others!
And, if you have any thoughts or ideas on how to get custom icons for BC as PWA, then please let me know! 😊
