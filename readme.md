# Index Directory
### *Package Name*: index-directory
### *Child Type*: Shell
### *Platform*: All
### *Required*: Required

This child module is built to be used by the Brigham Young University - Idaho D2L to Canvas Conversion Tool. It utilizes the standard `module.exports => (course, stepCallback)` signature and uses the Conversion Tool's standard logging functions. You can view extended documentation [Here](https://github.com/byuitechops/d2l-to-canvas-conversion-tool/tree/master/documentation).

## Purpose
This shell module reads a D2L export directory and uses is to populate the contents array of the course object with file objects (defined in File.js). By indexing the D2L export and saving it to RAM we avoid writing every single change to the hard drive. A later shell module will write all the pre-import changes made to the hard drive at one time.

## How to Install

```
npm install index-directory
```

## Run Requirements
This child module requires the following fields in the course.info object:
* `unzippedFilePath`

## Options
None

## Outputs

If your module adds anything to `course.info` or anywhere else on the course object, please include a description of each in a table:

| Option | Type | Location |
|--------|--------|-------------|
| Content | Array of File objects | course.contents |

## Process
1. Read directory
2. sort contents into files & folders
3. if file, make file Obj, if dir, back to step 1

## Log Categories
This module does not use course.log anywhere.


## Requirements
We need to be able to save the D2L export into memory to avoid frequent read/write operations. 