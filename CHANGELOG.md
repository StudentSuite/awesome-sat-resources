# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project doesn't follow strict semantic versioning (it's a curated list, not
software), but releases are still tagged so changes are easy to point to.

## [Unreleased]

### Added

- 18 new resources, bringing the list to 30: Kaplan SAT, Mometrix SAT, Test
  Innovators, and Varsity Tutors SAT (mock tests); Albert SAT, College Board
  Student Question Bank, High School Test Prep SAT, Test Ninjas, and Union Test
  Prep SAT (practice questions); College Board, Khan Academy, MagooshSAT, Scalar
  Learning, and UWorld College Prep YouTube channels (video); Acely (courses);
  and College Board SAT Scores, Desmos Testing, and Kaplan Digital SAT Guide
  (study guides).
- 2 more community entries: College Confidential SAT Preparation and
  r/digitalSATs.
- A new **Vocab Bank** section: Magoosh SAT Vocabulary Flashcards, Membean,
  Quizlet SAT Vocabulary, and Vocabulary.com SAT Word Lists.
- 2 more community entries: Quora SAT and r/ApplyingToCollege.
- 10 hand-picked videos replacing the generic channel listings in Video
  Lessons & YouTube, now split into English, Math, and General subsections.

### Changed

- Dropped per-entry pricing badges entirely. Every entry is free by policy
  now, so there's nothing left to tag; a single note near the top of
  README.md says so instead. `scripts/check-list-format.mjs` no longer
  enforces a pricing badge on each entry.

### Removed

- The **Courses & Prep Platforms** and **Study Guides & Strategy** sections
  (1600.io, Acely, Magoosh SAT, College Board SAT Scores, Desmos Testing,
  Kaplan Digital SAT Guide, PrepScholar) to keep the list focused on practice,
  video, vocab, and community resources.
- The generic College Board, Khan Academy, MagooshSAT, Scalar Learning,
  SupertutorTV, and UWorld College Prep channel listings, replaced by
  hand-picked videos.
- The **Official Resources** section (College Board SAT Suite) and every
  freemium or paid entry (Mometrix SAT, Test Innovators, The Princeton Review
  SAT, Varsity Tutors SAT, Albert SAT, Test Ninjas, Union Test Prep SAT,
  UWorld SAT, Membean, Quizlet SAT Vocabulary), narrowing the list to free
  resources only. The surviving mock-test and practice-question entries are
  merged into one **Practice Tests** section.

## [1.0.0] - 2026-11-11

### Added

- Initial release of **Awesome SAT Resources**, a sister list to
  [Awesome Study Resources](https://github.com/StudentSuite/awesome-study-resources),
  [Awesome Student Resources](https://github.com/StudentSuite/awesome-student-resources),
  and [Awesome Skills & Plugins for Students](https://github.com/StudentSuite/awesome-skills-plugins-for-students),
  dedicated to the SAT.
- 12 resources moved over from the SAT section of Awesome Study Resources, the
  SupertutorTV channel, and the r/SAT community, sorted into seven sections:
  Official Resources, Mock Tests & Full-Length Practice, Practice Questions &
  Quizzes, Video Lessons & YouTube, Courses & Prep Platforms, Study Guides &
  Strategy, and Communities.
- The shared repository tooling from the sister lists: entry-format, count, and
  JSON-export checks, a duplicate-URL audit, awesome-lint, markdownlint, codespell,
  a weekly dead-link check, a monthly pricing re-review, a quarterly verification
  report, a weekly digest, a first-time-contributor welcome, a PR labeler, a stale
  bot, issue and PR templates, and an opt-in pre-commit hook.

[Unreleased]: https://github.com/StudentSuite/awesome-sat-resources/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/StudentSuite/awesome-sat-resources/releases/tag/v1.0.0
