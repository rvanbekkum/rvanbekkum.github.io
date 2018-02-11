---
layout: post
title:  "Exploring Document Creator Features with Docker"
date:   2018-02-11
excerpt: "Docker allows you to setup an NAV installation and get you started quickly, by creating something referred to as a container... To explore the features of Document Creator, you can create such a container using the `documentcreator/nav2018_demo` image, running just a single command!"
tag:
- dynamics nav
- document creator
- docker
comments: true
---

Document Creator is an add-on that offers an intuitive report designer for Dynamics NAV, separating report-logic from layout/presentation. If you are interested in exploring the various features of Document Creator, but don't want to go through the steps of installing the Demo into your existing NAV environment, then Docker might help you out!
Docker allows you to setup an NAV installation and get you started quickly, by creating something referred to as a *container*, which allows you to run a preconfigured, isolated NAV environment with everyting you need.
To explore the features of Document Creator, you can create such a container using the `documentcreator/nav2018_demo` image, running just a single command!

If you are not familiar with Docker yet, you may want to continue reading the next section that provides instructions for setting up Docker on Windows for running NAV containers.
If you have setup an NAV container earlier, you can skip ahead to the last section, which shows you how to create a container with NAV2018 and the latest demo version of Document Creator.

## Installing Docker for Windows

On the following page you will find the instructions for installing Docker on Windows 10: [Windows Containers on Windows 10](https://docs.microsoft.com/en-us/virtualization/windowscontainers/quick-start/quick-start-windows-10).
This is basically just a matter of running the installer, although there are two things to take into account:
* Hyper-V isolation needs to be enabled on your PC.
* The option "Switch to Windows containers..." needs to be selected in Docker.

**NOTE:** You only need to follow the first two steps on the linked page. The other steps are not necessary, and only provide further examples.
{: .notice}

## Installing the NavContainerHelper Powershell Module

Next, it is recommended to install the *NavContainerHelper* Powershell module. This module offers a set of commands which ease the setup of NAV containers and allow for easier customization (e.g., installing an NAV license file, making the C/SIDE and Windows client available).
This module can be installed by running the following command:

```Install-Module -Name navcontainerhelper -force```

You can check if the installation of the module was successful by running the following command, which will also show you the available commands:

```Write-NavContainerHelperWelcomeText```

**NOTE:** Of course, it is also possible to setup an NAV container without the commands from this module (i.e., using `docker run`). If you are interested in reading more about this, then I would advise to check out the documents that are available on the following page: [Microsoft Dynamics NAV for Windows Containers](https://hub.docker.com/r/microsoft/dynamics-nav/) (in the "How to use this image" section).
{: .notice}

## Creating a Document Creator DEMO Docker Container

To setup the NAV2018 Document Creator Demo container, you can run the following command:

```New-NavContainer -containerName DcrDemoNav110 -imageName documentcreator/nav2018_demo:latest -accept_eula -includeCSide -licenseFile "C:\temp\Cronus.flf"```

This command will create an NAV Docker container named "DcrDemoNav110" based on the latest available `documentcreator/nav2018_demo` image.
The options added, have the following function:
* **accept_eula**: Required option, which is used to indicate that you accept the Dynamics NAV EULA.
* **includeCSide**: Option which indicates that the Windows client and C/SIDE development environment should be made available, for which desktop shortcuts will be created automatically. Note that this option requires you to supply a license file. You can also leave out this option and use the NAV2018 Windows Client on your own system, connecting to the following server-address: `DcrDemoNav110:7046/nav`
* **licenseFile**: Option that expects the file-path to the NAV license you want to use (i.e., `.flf` file).

If you have already downloaded the `microsoft/dynamics-nav:2018` image earlier, then Docker will only download the additional files for the Document Creator.
After the download of the image is completed, the setup of the container should only take about half a minute. After that, you can start using NAV with the Document Creator Demo by opening one of the desktop shortcuts that were automatically created by Docker.

**NOTE:** The *NavContainerHelper* module will automatically create at least the following desktop shortcuts: "DcrDemoNav110 Web Client" (shortcut to the Web Client), "DcrDemoNav110 Command Prompt" (container prompt which you can use to access the files in the container) and "DcrDemoNav110 Powershell Prompt" (Powershell prompt specifically for executing NAV Powershell commands).
{: .notice}