# BibleGet plugin for WordPress
A plugin that let's you insert Bible quotes into your WordPress pages or posts, using the **Bible quote** block or the `[bibleget]` shortcode. Behind the scenes the texts for the Bible quotes are retrieved from the BibleGet I/O API endpoint. Bible quotes can be inserted either by Bible reference or (in the case of the **Bible quote** block) by searching for verses that contain a specific term.

![WordPress Plugin Downloads](https://img.shields.io/wordpress/plugin/dt/bibleget-io)
![WordPress Plugin Active Installs](https://img.shields.io/wordpress/plugin/installs/bibleget-io)
[![CodeFactor](https://www.codefactor.io/repository/github/bibleget-i-o/bibleget-wordpress/badge)](https://www.codefactor.io/repository/github/bibleget-i-o/bibleget-wordpress)

| Information       |                                                                                                                            |
|-------------------|----------------------------------------------------------------------------------------------------------------------------|
| Contributors      | JohnRDOrazio                                                                                                               |
| Author URI        | https://www.johnromanodorazio.com                                                                                          |
| Plugin URI        | https://www.bibleget.io                                                                                                    |
| Donate link       | https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HDS7XQKGFHJ58                                         |
| Tags              | bible, block, shortcode, quote, citation, verses, bibbia, citazione, versetti, biblia, cita, versiculos, versets, citation |
| Requires at least | WordPress 5.6                                                                                                              |
| Tested up to      | WordPress 6.4                                                                                                              |
| Requires PHP      | 7.4                                                                                                                        |
| Stable tag        | 7.9                                                                                                                        |
| License           | GPLv2 or later                                                                                                             |
| License URI       | http://www.gnu.org/licenses/gpl-2.0.html                                                                                   |

## Installation
1. Go to `Administration Area -> Plugins -> Add new` and search for `bibleget`, click on `Install Now`
2. `Activate` the plugin once installation is complete
3. Set the preferred Bible version or versions for your Bible quotes from the settings page `Administration Area -> Settings -> BibleGet I/O`
4. Set your preferred styling in the `WordPress Customizer -> BibleGet I/O` or when you add a `Bible quote` block in the block editor
5. Add Bible quotes to your articles and pages either with the `Bible quote` block or with the `[bibleget]` shortcode
6. Check out the [WordPress playlist on youtube](https://www.youtube.com/watch?v=KWd_q6e8A2w&list=PLakrDoGwcHgaqviULNtbIlBmmdmAQS1hp)!

## Youtube playlist

* Installation and removal of the BibleGet plugin for WordPress : https://youtu.be/KWd_q6e8A2w
* Adding a Google Fonts API key : https://youtu.be/zqJqU_5UZ5M
* Converting a BibleGet shortcode to a Gutenberg block : https://youtu.be/h1mgmTrg8Oc
* Using the BibleGet block, the BibleGet shortcode, and the Customizer : https://youtu.be/Y6YipqOfJBw
* Refreshing metadata from the BibleGet API : https://youtu.be/YrYj9T2k08c

## Usage
Once the plugin is installed, you will find a `Bible quote` block in the **widgets** section of the **block editor**, which is fairly intuitive to use since it has a sidebar with controls for the styling and the layout other than setting the Bible reference. Usage of the block allows for a real time preview of the final results.

Before WordPress had the block editor, it was necessary to use a **shortcode** to insert the Bible quotes, without being able to preview the results in real time. It was also necessary to use the WordPress Customizer to set the preferred styles.

It is still necessary to use the WordPress Customizer in order to make use of the Google Fonts API. But it is not possible to use some of the more recent layout options from the Customizer, this can only be done from the **Bible quote** block sidebar.

While using the **Bible quote** block is fairly straightforward, using the shortcode requires a little bit more explanation.

**Sample usage of the shortcode:**

  * `[bibleget query="Exodus 19:5-6,8;20:1-17" version="CEI2008"]`
  * `[bibleget query="Matthew 1:1-10,12-15" versions="NVBSE,NABRE"]`

Note from the above examples that it is possible to use either the `version` or `versions` parameter, they are interchangeable.
It is also possible to place the reference for the desired Bible quote in the contents of the shortcode in place of using the `query` parameter:

  * `[bibleget version="NABRE"]John 3:16;1 John 4:7-8[/bibleget]`

The Plugin also has a settings page **“BibleGet I/O”** under **“Settings”** in the Administration area, where you can choose your preferred Bible versions from those available on the BibleGet server so that you don’t have to use the `version` or `versions` parameter every time.
After you have made your choices in the settings area, remember to click on **“Save”**!
Once the preferred version is set you can simply use:

  * `[bibleget query="1 Cor 13"]`

Other parameters available to the shortcode are:
  * `popup`: can have a value of `true` or `false`. Will determine whether the text of the Bible quote will show in a full block, or instead in a popup window upon clicking the Bible quote. Example: `[bibleget query="Romans 8:28" popup="true"]`
  * `preferorigin`: can have a value of `GREEK` or `HEBREW`, useful in those cases where there are multiple texts for the same book, chapter or verse in the same Bible edition, such as in the Book of Esther where both versions are included, one based on the original Greek text, and the other based on the original Hebrew text. Example: `[bibleget query="Esther 1:1" preferorigin="HEBREW"]`
  * `layoutprefs_showbibleversion`: can have a value of `true` or `false`. Example: `[bibleget query="Ezekiel 25:17" layoutprefs_showbibleversion="false"]`
  * `layoutprefs_bibleversionalignment`: can have a value of `LEFT`, `CENTER`, `RIGHT` or `JUSTIFY`. Example: `[bibleget query="Psalm 149:3" layoutprefs_bibleversionalignment="LEFT"]`
  * `layoutprefs_bibleversionposition`: can have a value of `TOP`, `BOTTOM` or `BOTTOMINLINE`. Example: `[bibleget query="2 Samuel 6:14" layoutprefs_bibleversionposition="BOTTOM"]`
  * `layoutprefs_bibleversionwrap`: can have a value of `NONE`, `PARENTHESES` or `BRACKETS`. Example: `[bibleget query="Ecclesiastes 3:1-4" layoutprefs_bibleversionwrap="BRACKETS"]`
  * `layoutprefs_bookchapteralignment`: can have a value of `LEFT`, `CENTER`, `RIGHT` or `JUSTIFY`. Example: `[bibleget query="Galatians 5:7-10" layoutprefs_bookchapteralignment="RIGHT"]`
  * `layoutprefs_bookchapterposition`: can have a value of `TOP`, `BOTTOM` or `BOTTOMINLINE`. Example: `[bibleget query="Mark 13:35-37" layoutprefs_bookchapterposition="BOTTOMINLINE"]`
  * `layoutprefs_bookchapterwrap`: can have a value of `NONE`, `PARENTHESES` or `BRACKETS`. Example: `[bibleget query="John 8:12" layoutprefs_bookchapterwrap="PARENTHESES"]`
  * `layoutprefs_bookchapterformat`: can have a value of `USERLANG`, `BIBLELANG`, `USERLANGABBREV` or `BIBLELANGABBREV`. Example: `[bibleget query="Psalms 144:1-2" layoutprefs_bookchapterformat="USERLANGABBREV"]`
  * `layoutprefs_bookchapterfullquery`: can have a value of `true` or `false`. Example: `[bibleget query="Isaiah 6:8" layoutprefs_bookchapterfullquery="true"]`
  * `layoutprefs_showversenumbers`: can have a value of `true` or `false`. Example: `[bibleget query="1 John 2:15-17" layoutprefs_showversenumbers="false"]`

The style settings are customizable using the **Wordpress Customizer**, so you can make the Bible quotes fit the style of your own blog / WordPress website.

When using the **Bible quote** block in the **block editor**, you will find all of the same styling options as in the WordPress Customizer except for the choice of the Font; furthermore you will find a number of customizable options not available in the WordPress Customizer which allow you to set not only the style but also the layout of the elements that make up the Bible quote.

## Frequently Asked Questions

### How do I formulate a Bible citation?
The `query` parameter must contain a Bible reference formulated according to the standard notation for Bible citations (see [Bible citation](http://en.wikipedia.org/wiki/Bible_citation "http://en.wikipedia.org/wiki/Bible_citation") on Wikipedia).
Two different notations can be used, the English (Chicago Manual of Style) notation and the International style notation.

**ENGLISH NOTATION (aka Chicago Manual of Style):**

  * “:” is the chapter – verse separator. “15:5” means “chapter 15, verse 5”.

  * “-” is the from – to separator, and it can be used in one of three ways:

    * from chapter to chapter: “15-16″ means “from chapter 15 to chapter 16”.
    * from chapter,verse to verse (of the same chapter): “15:1-5” means “chapter 15, from verse 1 to verse 5”.
    * from chapter,verse to chapter,verse “15:1-16:5” means “from chapter 15,verse 1 to chapter 16,verse 5”.

  * “,” is the separator between one verse and another. “15:5,7,9” means “chapter 15,verse 5 then verse 7 then verse 9”.

  * “;” is the separator between one query and another. “15:5-7;16:3-9,11-13” means “chapter 15, verses 5 to 7; then chapter 16, verses 3 to 9 and verses 11 to 13”.

**INTERNATIONAL NOTATION:**

  * “,” is the chapter - verse separator. “15,5” means “chapter 15, verse 5”.

  * “-” same as English notation

  * “.” is the separator between one verse and another. “15,5.7.9” means “chapter 15,verse 5 then verse 7 then verse 9”.

  * “;” same as English notation

Either notation can be used, however they cannot be mixed within the same query.

MLA style notation (which uses a “.” dot as the chapter verse separator, and only supports verse ranges, not non-consecutive verses) is not supported.

At least the first query (of a series of queries chained by a semi-colon) must indicate the name of the book to quote from; the name of the book can be written in full in more than 20 different languages, or written using the abbreviated form.
See the page [List of Book Abbreviations](https://www.bibleget.io/how-it-works/list-of-book-abbreviations/ "List of Book Abbreviations").
When a query following a semi-colon does not indicate the book name, it is intended that the same book as the previous query will be quoted.
So “Gen1:7-9;4:4-5;Ex3:19” means “Genesis chapter 1, verses 7 to 9; then again Genesis chapter 4, verses 4 to 5; then Exodus chapter 3, verse 19”.

### I am requesting a long Bible quote but I'm only getting 30 verses
If you are using a version of the Bible that is covered by copyright, you will not be able to quote more than 30 verses at once. So if you request for example “Gen1” using the NABRE version, you might expect to get back Gen1:1-31 but instead you will only get back Gen1:1-30. This is a limit imposed by the legal agreements for usage of these versions, it's not a bug, it's by design. If you need more than 30 verses when requesting a version covered by copyright, formulate the request as multiple quotes split up into no more than 30 verses each, for example “Gen1:1-30;1:31”.

### What happens if I add a Google Fonts API key?
If you add a Google Fonts API key, the BibleGet plugin will immediately test it's validity. If valid, it will remember that you have a key and that it's valid for 3 months. Every three months starting from this moment the BibleGet plugin will talk with the Google Fonts API to get the latest list of available Google Fonts, and will download to the plugin folders a local compressed copy of each of those fonts for the purpose of previewing them in the customizer interface.
You will need to be a bit patient the first time as it will take a couple minutes to complete the download process. A progress bar will let you know how the download is progressing. If you have a slow connection, the progress might stall for a few seconds every now an then (around 25%, 50%, and 75%), just be patient and it should continue to progress to the end. In the future, whenever the plugin talks with the Google Fonts API, the process should go a lot faster as it will only need to download new fonts.
It will also generate a css file that will load the preview of the fonts when you open the customizer interface. This does have a bit of a performance impact, and especially the first time you open the customizer it might take a minute to load. After this it should go a little faster as the fonts previews should be cached by the browser. If you are not happy with the performance impact, I would suggest to delete the Google Fonts API key.

### I have added the Google Fonts API key but the list of available fonts isn't updated
The BibleGet plugin will remember that your key is valid for 3 months. This means that it will not fetch the list of fonts from the Google Fonts API until the relative transient expires. If a new font has come out that you would like to see and use in the customizer interface for the BibleGet plugin, and you don't want to have to wait until the transient expires in that 3 month time slot, then you can click on the "force refresh" option below your API key.

### I added the Google Fonts API key but while it was processing the download it stopped with a 504 http status error
If you receive a 504 http status error it means that the connection with the Google Fonts API timed out for some reason. The BibleGet plugin tries to handle this situation by forcing the process to start again, but if instead the process comes to a halt please let the plugin author know at admin@bibleget.io in order to look further into the handling of this situation. In any case you can reload the page and use the "force refresh" option below your API key and the process will pick up where it left off.

### I updated the plugin to version 5.4 or later, but the new 'Bible quote' block doesn't seem to be cooperating
In order to allow for new layout options, the BibleGet I/O API itself was slightly updated, and there is a little more information in the response from the server.
However Bible quotes are cached by the BibleGet plugin for a seven day period, which means that from the time of the update until about a week later the cached Bible quotes will not have the necessary information for them to work with the 'Bible quote' block.
If you do not want to wait seven days or until the cache expires, there is a new option in the BibleGet Settings page since version 5.7 which allows to flush the cache.
A word of caution however: the more recent updates to the BibleGet service endpoint have started imposing hard limits on the number of requests that can be issued from any given domain, IP address or referer. No more than 30 requests for one same Bible quote can be issued in a two day period, and no more than 100 requests for different Bible quotes can be issued in a two day period. If you have many Bible quotes on your website and you risk hitting the limit, it may be best not to flush the cache all at once but rather wait out the seven days until the cache expires.

### I'm not able to use some options in the Gutenberg block such as positioning of the Bible version
There was recently an update to the BibleGet I/O API which slightly changed the structure of the html that comprises the Bible quotes. It is necessary to update the plugin to v5.9 in order to be compatible with these changes.

_________

![BibleGet Website](https://github.com/paulrobertlloyd/socialmediaicons/blob/main/huffduffer-16x16.png?raw=true) [BibleGet Website](https://www.bibleget.io/ "BibleGet Project Website")

![Subscribe on Youtube](https://github.com/paulrobertlloyd/socialmediaicons/blob/main/youtube-16x16.png?raw=true) [Subscribe to the Youtube channel!](https://www.youtube.com/channel/UCDt6zo7t6q0oE3ZRyY0YVOw?sub_confirmation=1 "BibleGet Youtube channel")

![Like on Facebook](https://github.com/paulrobertlloyd/socialmediaicons/blob/main/facebook-16x16.png?raw=true) [Follow on Facebook!](https://www.facebook.com/BibleGetIO/ "BibleGet Facebook Page")

![Follow on Twitter](https://github.com/paulrobertlloyd/socialmediaicons/blob/main/twitter-16x16.png?raw=true) [Follow on Twitter!](https://twitter.com/biblegetio "@BibleGetIO")
