This repository gathers a number of tools which can help you interact with GitHub and Airtable. I created these tools to help me in my day to day tasks and I wanted to share them with other people that might need them.

I am not a javascript expert, the code for these tools was generated using AI following my promts. The generated code works but can probably be improved. If someone is a JS expert and would like to take a shot at improving them, PRs are welcome!!

## Using the code

The tools are provided in three formats:
- The full expanded original javascript code created by the AI, this is provided in case you want to modify it
- An encoded version which can be used to add a bookmarklet in the browser
- A folder with files which can be used to load the code as a Chrome extension

To generate the encoded version I used this page: https://mrcoles.com/bookmarklet/

To use the bookmarklet code, click on your bookmark bar and select `Add Page...`, enter the name that you want to use and in the URL box copy the encoded bookmarklet code. Then go to GitHub and click on the bookmarklet in your bookmark bar to activate it

To use the extension, go to the `extensions` page in your Chrome settings and enable `Developer mode` (on the top right of the page). Then click on `Load Unpacked` and select the folder with the extension files. Click on the extension icon to activate it

## Available tools

These are the currently available tools. You will find each of them in their respective folder

### Stopwatch

This can be used to track the time spent on a task. Go to the airtable page for your task and click on the bookmarklet. This will show a stopwatch on the top right corner of this page. Use the play/pause buttons when you start working on a task/pause working on it. When you click the "checkmark" button, the time will be rounded to the next minute and added to the time spent on the task. The X button can be used to close the stopwatch. A couple of caveats: this stopwatch does not distinguish between tasks so it will just update the task that you happen to have open and also if you reload the page the stopwatch and the time recorded will be lost, so be careful there

### Comment extractor

When clicked, it will extract all the GitHub comments from the page and copy them to the clipboard separated by ------- lines. You can then paste this into the AI of your choice and ask it to check all comments for spelling/grammar errors. This is great to do a last check on your PR comments before submitting them. Use the bookmarklet in the conversation tab of your PR, not the files changed tab so that it can pick both your inline and general comments.

### Double click edit

When you click the bookmarklet in any GitHub page then you can just double-click on any comment to edit it, which makes editing comments faster

### Find And Replace

This one allows you to do a "find and replace" in all comments in the GitHub page. Useful when you need to change the same text in multiple comments without having to edit them individually.
