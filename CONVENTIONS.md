# Project Conventions

For developers and maintainers contributing to the project. I'll be honest - a lot of this is me taking notes to come back to for my own benefit.

## Project Versioning

TL;DR - we're doing strict semantic versioning, and there's some consistency rules to keep three related projects following similar version#s.

Here are the three repositories that participate in the functionality of creating new Decent App projects.

+-------------------+                   +--------------------+                +---------------+
| create-decent-app |---- git clone --->| decentapp-template |---- import --->| decent-portal |
+-------------------+                   +--------------------+                +---------------+

Consistency Rules:
* The latest `create-decent-app` tagged version must always match the latest `decentapp-template` tagged version fully (x.y.z).
* The latest `decentapp-template` tagged version must always match the latest `decent-portal` tagged version for major (x.*.*).
* `package.json` versions should match tagged versions for the commit in which they are tagged.
* The `decent-portal` package should be published via NPM after tagging.

### Changes Originating from Create-Decent-App

Typically, `create-decent-app` updates are a reaction to changes originating elsewhere. But it's possible that it works the other way, and there is some change to how CDA works, e.g., we add some extra project generation options, that has no corresponding update in `decentapp-template`.

Version bumps for changes originating in this project:
* Major - Not bumped for self-originating changes. (Okay, if the CLI interface had a breaking change. But this is very unlikely.)
* Minor - Changes in functionality.
* Patch - Bugfixes or non-functional changes.

### Changes Originating from Decentapp-Template

`decentapp-template` has no APIs and can't introduce breaking changes. In theory, it could break in some way that required an update to `create-decent-app` but since we always update these projects together and CDA always clones the version of `decentapp-template` that matches its own version, there is no reason to treat this as a breaking change in versioning.

Version bumps for changes originating in this project:
* Major - Not bumped for self-originating changes.
* Minor - Changes in functionality.
* Patch - Bugfixes or non-functional changes.

For any version of `decentapp-template` after 3.0.0, that version should be compatible with all versions of `decent-portal` that share the same major version# (x.*.*). This allows the Decent App developer to confidently upgrade the `decent-portal` library of their app.

### Changes Originating From Decent-Portal

Here we can definitely have breaking changes, and these will be the only source of major version bumps.

Version bumps for changes originating in this project:
* Major - Breaking changes.
* Minor - Changes in functionality.
* Patch - Bugfixes or non-functional changes.

It's possible that an update to `decent-portal` will include features that can't be used in older versions of `decentapp-template` without manual changes to source code. That's not considered a breaking change.

## Design Conventions

* The library is just a library - not a framework. It should be easy to add to/remove from a project.
* Does not introduce run-time dependencies. React and ReactDOM are peer dependencies.
* CSS is defined in CSS modules with component scope. No global CSS, other than explicit imports.
* The scope of functionality is limited to things that are specific to Decent Portal.
* No side effects, so the importing project can tree-shake unused code.