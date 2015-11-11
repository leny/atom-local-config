# `Local Config` package

> Override atom's config with a local file.

* * *

## How it works?

When a folder/project is loaded inside atom, **local-config** look for a local config file. If one is found, **local-config** will firstly backup your actual config, then override the config with the parameters inside the local config file.

If Atom can't find a local config file, it will restore the previously backed up config, if exists.

### Commands

#### Apply local config

Look for a local config file then apply it if exists.

#### Restore config

Restore previously backed up config.

### Settings

#### Local config file path

> Array of paths to lookup in project for local config file.

**default:** `".atom", ".atom.cson", "atom.cson", ".config.cson", "config.cson", "atom-config.cson"`

#### Auto apply

> If a local config file is found when project is loaded, it will be applied.

**default:** `false`

* * *

**Note:** this package is a simple (and probably a bit _dirty_) workaround until the "per-project settings" will be implemented in Atom's core.
