<img src="images/make_provider.png" align="right" />

# Make support and task runner

Run `make` tasks and targets from VS Code command picker or via tasks menu.

## Features

- Run `Make` from command picker
  - You can assign a shortcut to the command `make-task-provider.runTarget` and it will list all the available tasks to choose.
- List make as an option from the VS Code task runner menu
  - **Terminal -> Run task**
- Tasks-View listing all available targets
- Multiple workspaces ready!
- **NEW**: Set the executable path to your `make` command

### Running from the command picker:

![command picker](images/command-picker.gif)

### Running from the tasks view:

![command picker](images/task-tree.gif)

---

**PS:** This extension is **NOT** a re-implementation of `make`,
so you need to have `make` executables available on your system.

If `make` is not on your `PATH`, you can customize the executable path individually based on your operating system:

| OS      | Settings                                    | Example                                  |
| ------- | ------------------------------------------- | ---------------------------------------- |
| Windows | `make-task-provider.windows.makeExecutable` | "C:\\Program Files\\make\\bin\\make.exe" |
| Linux   | `make-task-provider.unix.makeExecutable`    | "/usr/bin/make"                          |
| Mac OS  | `make-task-provider.osx.makeExecutable`     | "/usr/bin/make"                          |
