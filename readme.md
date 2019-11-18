# datetime-substitution
Firefox addon that displays UNIX epoch time strings on any webpage in human readable format.

**This add-on injects JavaScript into web pages. The `addons.mozilla.org` domain disallows this operation, so this add-on will not work properly when it's run on pages in the `addons.mozilla.org` domain.**

## What it does

Replaces text string of UNIX epoch time with a human readable datetime. This runs as a content script and scans web pages, looking for text that can be replaced.
