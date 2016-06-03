---
title:  "Creating your own Extractor for youtube-dl"
date:   2016-06-03 18:48
categories: [youtube-dl]
tags: [youtube-dl, open-source, python]
---
Have you ever heard of **youtube-dl**?
It is an application that allows you to download videos (and other media) from YouTube, but also from more than **700 other supported websites**.
The application only requires you to have Python installed on your system and is quite simple to use.
You just open up your terminal and pass the URL to the video you want to download to the application as follows:

```
youtube-dl <VIDEO_URL>
```

Is one of your sites not supported? Then you might want to try to add support by writing your own *extractor* for those sites in youtube-dl, which is in most cases actually not that difficult (but it depends on the site, of course).

In this blog I will give you a quick summary of how you can add support for new sites.
The first thing you want to do is forking the [youtube-dl repository on GitHub](https://github.com/rg3/youtube-dl).
Let's say the site you want to support is called **'my_video_site'**, then what you want to do is creating a new file called `my_video_site.py` in the `youtube-dl/extractor` directory on your fork.
Then your extractor implementation in the `my_video_site.py` file will need to look something like the following:

```python
# coding: utf-8
from __future__ import unicode_literals
from .common import InfoExtractor

class MyVideoSiteIE(InfoExtractor):
    IE_NAME = 'MyVideoSite'   # Here you put the name of your extractor
    _VALID_URL = r'<REGEXP>'  # Here you define a reg. exp. matching valid URLs

    # You define your tests in the _TESTS variable as a list
    # of dictionaries representing the tests that each consist of
    # an example URL and the expected outputs of the extractor
    _TESTS = [{
        'url': '<EXAMPLE_URL>',         # An example URL that could be passed
        'info_dict': {                  # Dictionary expected from _real_extract
            'id': '<VIDEO_ID>',
            'url': '<FILE_URL',
            'ext': '<FILE_EXTENSION>',
            'title': '<VIDEO_TITLE>'
    }]

    def _real_extract(self, url):
        # In this function you do the actual extraction of data needed to download
        # the file, which the function will return in the form of a dictionary

        # <Your extraction code here>

        # Return the dictionary with the information about the video to download
        return {
            'id': video_id,
            'title': self._og_search_title(webpage),
            'formats': video_formats,
            'thumbnails': video_thumbnails
        }
```

When your extractor is ready you also need to update the `extractors.py` file in the same directory by adding an import of your extractor by adding the following line:

```python
from .my_video_site import MyVideoSiteIE
```

And that's it! Now you should be able to download videos from the site for which you just added an extractor. 
If you think your extractor may be useful to others you can file a pull request to the youtube-dl repository as well.

If you are interested in finding out more about youtube-dl and its software architecture you may want to check out the [DESOSA: 2016](https://www.gitbook.com/book/delftswa/desosa2016/details) (*Delft Students on Software Architecture: 2016*) book. In a group of four we contributed to this book by writing the [chapter on youtube-dl](https://delftswa.gitbooks.io/desosa2016/content/youtube-dl/chapter.html).
In this chapter you can find out all about the application, its developers, its features and architecture. You can also check out chapters on other interesting software systems such as [Atom](https://delftswa.gitbooks.io/desosa2016/content/atom/chapter.html), [GitLab](https://delftswa.gitbooks.io/desosa2016/content/gitlab/chapter.html) and [Ruby on Rails](https://delftswa.gitbooks.io/desosa2016/content/rails/chapter.html) in this book to learn more about them. Enjoy reading!

Cheers!