## 2.1.0 (2021-08-16)

* Migrate to file parse instead of relying on Make (#11) ([88c2b9d](https://github.com/carlos-algms/vscode-make-task-provider/commit/88c2b9d)), closes [#11](https://github.com/carlos-algms/vscode-make-task-provider/issues/11)



## <small>2.0.2 (2021-08-09)</small>

* Reset file watcher when config changes (#10) ([6c671ea](https://github.com/carlos-algms/vscode-make-task-provider/commit/6c671ea)), closes [#10](https://github.com/carlos-algms/vscode-make-task-provider/issues/10)



## <small>2.0.1 (2021-08-09)</small>

* Customize makefile name (#9) ([b5b0309](https://github.com/carlos-algms/vscode-make-task-provider/commit/b5b0309)), closes [#9](https://github.com/carlos-algms/vscode-make-task-provider/issues/9)
* Fix lint issues ([4a8d8ef](https://github.com/carlos-algms/vscode-make-task-provider/commit/4a8d8ef))



## 2.0.0 (2021-08-09)

* Allow using any name for the Makefile ([12e4042](https://github.com/carlos-algms/vscode-make-task-provider/commit/12e4042))
* Display the right file name in the tasks tree ([8640789](https://github.com/carlos-algms/vscode-make-task-provider/commit/8640789))
* Use the right Makefile when executing a target ([4546f2c](https://github.com/carlos-algms/vscode-make-task-provider/commit/4546f2c))



## 1.5.0 (2021-08-02)

* Allow case insensitive file name for Makefiles (#8) ([7d21b50](https://github.com/carlos-algms/vscode-make-task-provider/commit/7d21b50)), closes [#8](https://github.com/carlos-algms/vscode-make-task-provider/issues/8)
* Enable built in variables and targets (#7) ([58edd48](https://github.com/carlos-algms/vscode-make-task-provider/commit/58edd48)), closes [#7](https://github.com/carlos-algms/vscode-make-task-provider/issues/7)



## <small>1.4.2 (2021-02-22)</small>

* Limit the exceptions sent to Sentry ([a83668b](https://github.com/carlos-algms/vscode-make-task-provider/commit/a83668b))
* Update README for executables path settings ([1007f8d](https://github.com/carlos-algms/vscode-make-task-provider/commit/1007f8d))



## <small>1.4.1 (2021-02-04)</small>

* Fix target names with dependencies or variables ([37f6073](https://github.com/carlos-algms/vscode-make-task-provider/commit/37f6073))



## 1.4.0 (2021-01-31)

* Enable setting make executable path ([df76f99](https://github.com/carlos-algms/vscode-make-task-provider/commit/df76f99)), closes [#3](https://github.com/carlos-algms/vscode-make-task-provider/issues/3)
* Fix make executable path when not set by user ([eb84dda](https://github.com/carlos-algms/vscode-make-task-provider/commit/eb84dda))
* Include executablePath instructions ([726a10c](https://github.com/carlos-algms/vscode-make-task-provider/commit/726a10c))



## <small>1.3.1 (2021-01-29)</small>

* Better error handling and notifications to user ([57e96ec](https://github.com/carlos-algms/vscode-make-task-provider/commit/57e96ec))



## 1.3.0 (2021-01-28)

* Build using ESBuild ([b1c37cb](https://github.com/carlos-algms/vscode-make-task-provider/commit/b1c37cb))
* Fix package.json import to avoid bundling it ([23458f3](https://github.com/carlos-algms/vscode-make-task-provider/commit/23458f3))
* Send exceptions to Sentry instead of Amplitude ([689d9ef](https://github.com/carlos-algms/vscode-make-task-provider/commit/689d9ef))



## 1.2.0 (2021-01-26)

* Adjust vscode types to match engine ([7f08e31](https://github.com/carlos-algms/vscode-make-task-provider/commit/7f08e31))
* Adjust vscode version to match engines ([ecf62c8](https://github.com/carlos-algms/vscode-make-task-provider/commit/ecf62c8))
* Clear build before compile ([cbfd8f3](https://github.com/carlos-algms/vscode-make-task-provider/commit/cbfd8f3))
* Fix changelog cli command ([044afe2](https://github.com/carlos-algms/vscode-make-task-provider/commit/044afe2))
* Include .temp as ignored ([b04b0c5](https://github.com/carlos-algms/vscode-make-task-provider/commit/b04b0c5))
* Send telemetry data to Amplitude (#2) ([90ed73b](https://github.com/carlos-algms/vscode-make-task-provider/commit/90ed73b)), closes [#2](https://github.com/carlos-algms/vscode-make-task-provider/issues/2)
* Split tasks fetcher from files fetcher ([7dbda1e](https://github.com/carlos-algms/vscode-make-task-provider/commit/7dbda1e))
* Upgrade dependencies ([791d13e](https://github.com/carlos-algms/vscode-make-task-provider/commit/791d13e))
* Upgrade ESLint and fix new styles ([520830f](https://github.com/carlos-algms/vscode-make-task-provider/commit/520830f))



## <small>1.1.3 (2020-11-05)</small>

* Included Composer vendor folder to excludes ([4517cde](https://github.com/carlos-algms/vscode-make-task-provider/commit/4517cde))



## <small>1.1.2 (2020-11-04)</small>

* Include tree-view to the README ([00d0998](https://github.com/carlos-algms/vscode-make-task-provider/commit/00d0998))
* Refactored Tree View to show tasks from tasks.json ([766a4b7](https://github.com/carlos-algms/vscode-make-task-provider/commit/766a4b7))
* Replaced Makefile hardcoded with constant ([ec4c5be](https://github.com/carlos-algms/vscode-make-task-provider/commit/ec4c5be))
* Updated command description ([d6cfc91](https://github.com/carlos-algms/vscode-make-task-provider/commit/d6cfc91))



## <small>1.1.1 (2020-10-30)</small>

* Use common ignores while searching for Makefiles ([8ffaf19](https://github.com/carlos-algms/vscode-make-task-provider/commit/8ffaf19))



## 1.1.0 (2020-10-30)

* Create a Tree View to list all available Tasks ([345834c](https://github.com/carlos-algms/vscode-make-task-provider/commit/345834c))
* Enabled more restricted Linter rules ([b5d10b7](https://github.com/carlos-algms/vscode-make-task-provider/commit/b5d10b7))
* Refactor for better tracking multiple Makefiles ([7311146](https://github.com/carlos-algms/vscode-make-task-provider/commit/7311146))
* Refactored Task Provider to more functional style ([2ce7570](https://github.com/carlos-algms/vscode-make-task-provider/commit/2ce7570))
* Removed unused code ([80fcc1e](https://github.com/carlos-algms/vscode-make-task-provider/commit/80fcc1e))
* Use VSCode full qualified props to avoid collision ([e2e7b73](https://github.com/carlos-algms/vscode-make-task-provider/commit/e2e7b73))



## <small>1.0.4 (2020-10-21)</small>

* Enabled eslint rules that required Types ([5283fef](https://github.com/carlos-algms/vscode-make-task-provider/commit/5283fef))
* Enhanced Eslint Rules ([68b74f3](https://github.com/carlos-algms/vscode-make-task-provider/commit/68b74f3))
* Enhanced ESLint rules ([f738b07](https://github.com/carlos-algms/vscode-make-task-provider/commit/f738b07))
* Exclude build folder ([680a6d2](https://github.com/carlos-algms/vscode-make-task-provider/commit/680a6d2))
* Fix changelog command before publish ([38156cc](https://github.com/carlos-algms/vscode-make-task-provider/commit/38156cc))
* Fix return type ([f06acd6](https://github.com/carlos-algms/vscode-make-task-provider/commit/f06acd6))
* Included changelog generation ([8331e8a](https://github.com/carlos-algms/vscode-make-task-provider/commit/8331e8a))



## <small>1.0.3 (2020-10-21)</small>

* 1.0.3 ([9a5ab9b](https://github.com/carlos-algms/vscode-make-task-provider/commit/9a5ab9b))
* Fix dependency ([16094af](https://github.com/carlos-algms/vscode-make-task-provider/commit/16094af))



## <small>1.0.2 (2020-10-21)</small>

* 1.0.2 ([dd0188d](https://github.com/carlos-algms/vscode-make-task-provider/commit/dd0188d))
* Grouping features together ([f4afda0](https://github.com/carlos-algms/vscode-make-task-provider/commit/f4afda0))



## <small>1.0.3 (2020-10-21)</small>

* 1.0.3 ([9a5ab9b](https://github.com/carlos-algms/vscode-make-task-provider/commit/9a5ab9b))
* Fix dependency ([16094af](https://github.com/carlos-algms/vscode-make-task-provider/commit/16094af))



## <small>1.0.2 (2020-10-21)</small>

* 1.0.2 ([dd0188d](https://github.com/carlos-algms/vscode-make-task-provider/commit/dd0188d))
* Grouping features together ([f4afda0](https://github.com/carlos-algms/vscode-make-task-provider/commit/f4afda0))



## <small>1.0.1 (2020-10-21)</small>

- 1.0.1 ([cc12d05](https://github.com/carlos-algms/vscode-make-task-provider/commit/cc12d05))
- Update repository field ([d962bd6](https://github.com/carlos-algms/vscode-make-task-provider/commit/d962bd6))

## 1.0.0 (2020-10-21)

- 1.0.0 ([e12b69b](https://github.com/carlos-algms/vscode-make-task-provider/commit/e12b69b))
- Bootstrap project ([c9986b8](https://github.com/carlos-algms/vscode-make-task-provider/commit/c9986b8))
- Changed autoDetect to boolean ([9b01d08](https://github.com/carlos-algms/vscode-make-task-provider/commit/9b01d08))
- Cleanup detectors when extension is disabled ([e19f3b6](https://github.com/carlos-algms/vscode-make-task-provider/commit/e19f3b6))
- Cleanup FolderDetector ([f091be5](https://github.com/carlos-algms/vscode-make-task-provider/commit/f091be5))
- Cleanup TaskDetector methods ([ae0f385](https://github.com/carlos-algms/vscode-make-task-provider/commit/ae0f385))
- Client should not know about the start rules ([76d9672](https://github.com/carlos-algms/vscode-make-task-provider/commit/76d9672))
- Create Makefile with vsce commands ([d9af6ba](https://github.com/carlos-algms/vscode-make-task-provider/commit/d9af6ba))
- Created task definition ([bafe3a4](https://github.com/carlos-algms/vscode-make-task-provider/commit/bafe3a4))
- Created the Task Provider for Make ([b6cd27d](https://github.com/carlos-algms/vscode-make-task-provider/commit/b6cd27d))
- Enable prefer-const eslint rule ([bec9e20](https://github.com/carlos-algms/vscode-make-task-provider/commit/bec9e20))
- Enable run target from command picker ([0a01625](https://github.com/carlos-algms/vscode-make-task-provider/commit/0a01625))
- Enhance dispose usage ([5b34136](https://github.com/carlos-algms/vscode-make-task-provider/commit/5b34136))
- Enhanced showError to check if the user dismissed ([8dfb2fe](https://github.com/carlos-algms/vscode-make-task-provider/commit/8dfb2fe))
- Extract fetching make targets to helper file ([fb426a2](https://github.com/carlos-algms/vscode-make-task-provider/commit/fb426a2))
- Fix build path ([b2d6ddd](https://github.com/carlos-algms/vscode-make-task-provider/commit/b2d6ddd))
- Import vscode as a Type ([cad9a34](https://github.com/carlos-algms/vscode-make-task-provider/commit/cad9a34))
- Include DS_Store to ignored ([3d0b42d](https://github.com/carlos-algms/vscode-make-task-provider/commit/3d0b42d))
- Include icon ([165ab7d](https://github.com/carlos-algms/vscode-make-task-provider/commit/165ab7d))
- Include repository field ([4d85279](https://github.com/carlos-algms/vscode-make-task-provider/commit/4d85279))
- Included configurations contributions section ([ff8df5a](https://github.com/carlos-algms/vscode-make-task-provider/commit/ff8df5a))
- Included Repository banner image ([43a97bc](https://github.com/carlos-algms/vscode-make-task-provider/commit/43a97bc))
- Including author ([2fd74c9](https://github.com/carlos-algms/vscode-make-task-provider/commit/2fd74c9))
- Including usage instructions ([05ef71e](https://github.com/carlos-algms/vscode-make-task-provider/commit/05ef71e))
- Initial commit ([99857e7](https://github.com/carlos-algms/vscode-make-task-provider/commit/99857e7))
- Renamed to make-task-provider ([4e3b1b5](https://github.com/carlos-algms/vscode-make-task-provider/commit/4e3b1b5))
- Replaced deprecated method fs.exists ([5f9bdf5](https://github.com/carlos-algms/vscode-make-task-provider/commit/5f9bdf5))
- Set to ES2019 for smaller build files ([a37110b](https://github.com/carlos-algms/vscode-make-task-provider/commit/a37110b))
- Updated repository field ([cfabdcb](https://github.com/carlos-algms/vscode-make-task-provider/commit/cfabdcb))
