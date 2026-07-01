# Security Policy

Security reports are taken seriously. If you find a vulnerability in
Despical's Libraries, please report it privately instead of opening a public
issue.

## Reporting a Vulnerability

Please send security reports to:

```text
contact@despical.dev
```

When possible, include the following details:

* A clear description of the vulnerability.
* Steps to reproduce the issue.
* The affected page, commit, branch, workflow, or deployment environment.
* Any relevant logs, screenshots, request examples, or proof of concept details.
* Whether the issue affects the public GitHub Pages site, generated library
  data, dependency snippets, or repository automation.

Please do not include destructive payloads, real user data, private credentials,
or anything that could damage a running deployment.

## Scope

The following areas are considered security-sensitive:

* Cross-site scripting or HTML injection in rendered library data, badges,
  snippets, links, or static generated markup.
* Unsafe handling of repository, documentation, badge, or stargazer links.
* Vulnerabilities in the data update and static generation scripts.
* GitHub Actions workflow issues that could expose secrets, publish unintended
  output, or allow untrusted code execution.
* Dependency or supply-chain issues that affect the built GitHub Pages site.
* Incorrect security headers or deployment configuration for the public site.

Reports about outdated library versions, broken links, inaccurate metadata,
spam, SEO content, or non-security bugs should use the normal GitHub issue
tracker instead.

## Supported Versions

Only the latest public version on the `main` branch and the currently deployed
GitHub Pages site are supported. If you are running an older fork or commit,
please update before reporting unless the same issue also exists on the latest
version.

## Response

After a valid report is received, the issue will be reviewed as soon as possible.
If the report is confirmed, a fix will be prepared privately and released with
credit where appropriate.

Please avoid public disclosure until a fix is available.
