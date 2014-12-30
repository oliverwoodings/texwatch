# texwatch

Texwatch is a command line utility for live building and spell-checking LaTeX projects. It allows you to have all the benefits of a code editor when writing your TeX but still have the power of seeing your PDF being compiled automatically when you save.

Texwatch requires the following to be installed:

* NodeJS - Advise using NVM to manage your NodeJS installations
* pdflatex - Comes as part of MacTeX or any other standard LaTeX package if you aren't on OSX
* hunspell - Can be installed using Homebrew
* dictionaries - See the dictionaries section in the installation section

At this point in time it has only been tested on OSX.


## Installation

After you have NodeJS installed, just run the following from anywhere on your computer:

```npm install -g texwatch```

### Dictionaries

Hunspell does not come with its own dictionaries. Most of the time you need to install them yourself. Do the following to find out if you need to install any:

1. Type ```hunspell -D```
1. In the output there should be a section called _AVAILABLE DICTIONARIES_
1. If it is empty, or if it says there are no available dictionaries, then you need to install dictionaries.


Here are some instructions on how to install a set of english dictionaries for OSX:

1. Download the [OpenOffice English Dictionaries Extension](http://extensions.openoffice.org/en/project/english-dictionaries-apache-openoffice).
1. Change the extension of the file to .zip
1. Extract the .zip file
1. Type ```hunspell -D``` and find the output section called _SEARCH PATH:_
1. Place all the .dic and .aff files from the zip file into any of the folders in the search path
1. Run ```hunspell -d``` again - it should now say there are dictionaries present and loaded.


## Usage

Simply run ```texwatch``` in your LaTeX project folder.

Texwatch assumes that your document is called _document.pdf_. If it isn't you can specify it as an argument: ```texwatch mydoc.pdf```.

This command will start a watch service that recursively monitors all .tex files in the directory. When a file is changed, the main _document.tex_ file will be rebuilt using pdflatex and (optionally) spellchecking will be performed using hunspell.


## .texwatchrc

The _.texwatchrc_ can be used to override default texwatch settings. This file should be placed in your project root and can contain any of the options below, structured in JSON. Example:

```javascript
{
  "spellCheck": false,
  "log": false,
  "personalDictionary": [
    "Woodings",
    "JavaScript"
  ],
  "file": "mydoc.tex"
}
```

### options

#### log: false
Enable or disable log output to the console.

#### watchGlob: **/*.tex
Globbing pattern given to the watch service.

#### dir: ./
Directory to run texwatch from.

#### file: document.tex
Filename of the main .tex file.

#### personalDictionary: []
Array of personal dictionary entries. This can be used to prevent unknown words from showing up in the spellcheck report. For basic usage, just populate this array with words. This array is actually used as a MySpell dictionary, which is passed to hunspell as a personal dictionary file. MySpell dictionaries make use of affix files which allow you to specify how words can be manipulated (e.g. can be pluralised). For more information on affix files, see: the [hunspell manpage](http://manpages.ubuntu.com/manpages/dapper/man4/hunspell.4.html).

#### tmpDictFile: .texwatchtmpdict
Temp file used to write the personal dictionary.

#### dictionary: en_GB
Dictionary to use with hunspell

#### spellCheck: true
Enable or disable spell checking