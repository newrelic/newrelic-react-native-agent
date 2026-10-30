# Contributing

Contributions are always welcome. Before contributing please read the
[code of conduct](https://github.com/newrelic/.github/blob/main/CODE_OF_CONDUCT.md) and [search the issue tracker](issues); your issue may have already been discussed or fixed in `main` or `develop`. To contribute,
[fork](https://help.github.com/articles/fork-a-repo/) this repository, commit your changes, and [send a Pull Request](https://help.github.com/articles/using-pull-requests/) to `develop`.

Note that our [code of conduct](https://github.com/newrelic/.github/blob/main/CODE_OF_CONDUCT.md) applies to all platforms and venues related to this project; please follow it in all your interactions with the project and its participants.

## Feature Requests

Feature requests should be submitted in the [Issue tracker](../../issues), with a description of the expected behavior & use case, where they’ll remain closed until sufficient interest, [e.g. :+1: reactions](https://help.github.com/articles/about-discussions-in-issues-and-pull-requests/), has been [shown by the community](../../issues?q=label%3A%22votes+needed%22+sort%3Areactions-%2B1-desc).
Before submitting an Issue, please search for similar ones in the
[closed issues](../../issues?q=is%3Aissue+is%3Aclosed+label%3Aenhancement).

## Pull Requests

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
3. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## Release notes

Release notes for the React Native agent are drafted automatically and reviewed by a person before they are published on docs.newrelic.com, in the docs-website release-notes template format (`features`, `enhancements`, `bugs` and `security` arrays, no `category` line, and a `###` heading for each section that has entries). The automation is shared with the other mobile agents and lives in [newrelic/newrelic-android-agent `.github/actions/release-notes/`](https://github.com/newrelic/newrelic-android-agent/tree/develop/.github/actions/release-notes); its README explains how each bullet is built.

**Every PR merged to `main` needs exactly one of these labels**, unless it is left out of the notes (see below). The label decides which section of the published note the PR appears in:

| Label | Section | Use it for |
|---|---|---|
| `release-note:feature` | New features | A capability that did not exist before |
| `release-note:enhancement` | Improvements and enhancements | Improvements to existing behavior, **including native Android and iOS agent version bumps** |
| `release-note:bug` | Bug fixes | Something that was broken; say what was broken |
| `release-note:security` | Security updates | Security fixes |

Most React Native releases are native agent version bumps. Those are enhancements, not features. The `chore: Update native agents` PRs opened by `update_native_agent_version.yml` are labelled `release-note:enhancement` automatically, and their `## Release note` section repeats the `CHANGELOG.md` entries word for word, one `- ` line per updated agent, so each update is its own bullet.

- If the description has a `## Release note` heading (or a `Release note:` line), that text becomes the bullet as written, so say what changed for app developers or their users and, for a bug, what was broken. Otherwise the title is used with its type prefix and Jira key removed and the leading verb put in the past tense (`fix: guard against null filename (NR-1)` becomes "Guarded against null filename."). Write `N/A` to use the title.
- Unlabelled PRs whose title type is `docs`, `test`, `ci`, `chore`, `build` or `style`, and Dependabot PRs, are left out as not user-facing; add a `release-note:*` label to include one. Use `security:` as the title type for a security fix, or the `release-note:security` label.
- Put `[skip-docs]` anywhere in the PR description to leave a PR out (internal refactors, release chores).
- The `Release notes - check` check comments on your PR with the section and the exact bullet it will produce, and goes red if a user-facing PR into `main` does not have exactly one `release-note:*` label. A user-facing PR that merges without a label is still included (section guessed from the title, bot comment), and any PR that is left out is listed in the release's docs PR, so nothing disappears silently.

### How the notes are built

1. **On every merge to `main`**, `.github/workflows/release-notes-append.yml` adds the PR's bullet to the `react-native-next` branch of `newrelic/docs-website` (draft PR "React Native agent: next release notes", which is never merged). The branch starts from `react-native-agent-next.mdx` at the root of this repository.
2. **On every release**, `release-testing.yml` calls `.github/workflows/release-notes-generate.yml`, which reconciles three sources: the bullets on `react-native-next`, every PR between the previous tag and the new one, and the version's entries in `CHANGELOG.md`. A change that appears in more than one source appears once. It writes `react-native-agent-<version without dots>.mdx` (for example `react-native-agent-193.mdx`) with a version-pinned npm `downloadLink`, and opens a **draft** PR on `newrelic/docs-website`.
3. Settings are in `.github/release-notes.json`. The workflows need the `BOT_PAT` and `BOT_EMAIL` repository secrets.

### Release checklist

- [ ] Every user-facing PR since the last release carries one `release-note:*` label (native agent bumps: `release-note:enhancement`).
- [ ] `CHANGELOG.md` has a `## <version>` entry for the release.
- [ ] After the release, open the draft `React Native agent <version> release notes` PR on `newrelic/docs-website` and **edit it before it merges**: each bullet is specific and user-facing, bug bullets say what was broken, each bullet sits in the right section, each frontmatter array mirrors its section, and the lists under "From the CHANGELOG" and "PRs left out" in the PR description have been checked.
- [ ] Mark the docs PR ready for review. The `react-native-next` draft PR is updated or closed automatically.
- [ ] To rebuild the notes for an existing tag, run `release-notes-generate.yml` by hand with the version (for example `1.9.3`); tick `overwrite` only to discard edits already made on the docs PR.

## Contributor License Agreement

Keep in mind that when you submit your Pull Request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource@newrelic.com.

For more information about CLAs, please check out Alex Russell’s excellent post,
[“Why Do I Need to Sign This?”](https://infrequently.org/2008/06/why-do-i-need-to-sign-this/).

## Slack

We host a public Slack with a dedicated channel for contributors and maintainers of open source projects hosted by New Relic.  If you are contributing to this project, you're welcome to request access to the #oss-contributors channel in the newrelicusers.slack.com workspace.  To request access, please use this [link](https://join.slack.com/t/newrelicusers/shared_invite/zt-1ayj69rzm-~go~Eo1whIQGYnu3qi15ng).

## Testing

### Unit Tests

The agent includes a suite of tests which should be used to
verify your changes don't break existing functionality.

Tests are stored in the `new-relic/__tests__` directory.

Running the test suite is simple.  Just invoke:
```
    npm install
    npm test
```

### Writing Tests

For most contributions it is strongly recommended to add additional tests which
exercise your changes.

This helps us efficiently incorporate your changes into our mainline codebase
and provides a safeguard that your change won't be broken by future development.

There are some rare cases where code changes do not result in changed
functionality (e.g. a performance optimization) and new tests are not required.
In general, including tests with your pull request dramatically increases the
chances it will be accepted.