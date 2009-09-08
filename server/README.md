Server component
================

The server component is a web service providing access to the version control system etc. The proof-of-concept server component is written in with [web.py][].

[web.py]:   http://webpy.org/

Usage
-----
First, create a config file by copying `default.cfg` to `pontoon.cfg` and following the instructions in that file.

Second, create a new user account by running `pontoon-server.py` with an argument `--add --user fred --pass fred`. You can run `pontoon-server.py -h` to see a complete list of valid options.

Finally, run the Pontoon server by executing `pontoon-server.py`..
