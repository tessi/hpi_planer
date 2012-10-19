HPI Master-Plan
---------------
This is a HTML/JS-app built to help you organize your [HPI](http://hpi-web.de) masters program.
It tracks your courses and grades helping you to calculate your final grade and to plan which course you should take next.
The app follows the current (2010 until now) [study and examination regulations](http://www.uni-potsdam.de/ambek/ambek2010/15/Seite3.pdf).
If you experience any Bug, feel free to give me a pull request or file an issue.

**Disclaimer:**
The app is not a legal document. So ask our "Studienreferat" or refer to [the official document](http://www.uni-potsdam.de/ambek/ambek2010/15/Seite3.pdf) if you have any issues.

Website
-------
The app is hosted on [tessenow.org](http://tessenow.org/hpi_planer).
However, it is pretty simple to host it yourself (it's just static files).

I want to help!
---------------
Basically there are just two files neccessary to start developing. CSS and HTML is written in [index.html](https://github.com/tessi/hpi_planer/blob/master/index.html).
All JavaScript is done in [coffee/hpi_scheduler.coffee](https://github.com/tessi/hpi_planer/blob/master/coffee/hpi_scheduler.coffee).

To compile the js out of your coffee-file [compile_assets.sh](https://github.com/tessi/hpi_planer/blob/master/compile_assets.sh) helps you.
To circumvent same-origin-issues for local development, you may use [serve.sh](https://github.com/tessi/hpi_planer/blob/master/serve.sh) (which starts a simple python webserver on your development machine to serve the assets). Access it via http://localhost:8000

There are (jasmine) tests! Open http://localhost:8000/tests/SpecRunner.html in your browser to execute them.

This is done with the help of ...
---------------------------------
* [finnlabs](http://finn.de) allowed me to work on this app while being paid for it. Thats neat, isn't it?
* The design is based on [twitter bootstrap](http://twitter.github.com/bootstrap/)

Copyright and licence
---------------------
The app is licensed under the **MIT License**.
Bootstrap, jQuery and the jQuery-tablesorter-plugin have their own licenses.

*Copyright (c) 2012 Philipp Tessenow*

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.