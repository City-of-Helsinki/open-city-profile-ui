# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

## [1.9.0](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.8.0...open-city-profile-ui-v1.9.0) (2024-05-10)


### Features

* Profile data hide empty values from screenreaders HP-2309 ([abd48c7](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/abd48c7d4e392dbd10047260255c9d1b0af253f0))
* Remove vite-plugin-graphql-loader HP-2410 ([a732953](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/a7329532b1b207fb3a034b94c2002b73b80e1593))
* Update download my data button ([#341](https://github.com/City-of-Helsinki/open-city-profile-ui/issues/341)) ([e5f4fdd](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/e5f4fdd3c6ab1863824b970cb9546f5778ae13f4))
* Upgrade react-i18next HP-2410 ([f6a1fde](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/f6a1fde44a902c06e4553783e92279d3151e8b42))

## [1.8.0](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.7.0...open-city-profile-ui-v1.8.0) (2024-04-25)


### Features

* Delete profile service connection, modals use danger variant HP-2268 ([e53c8d5](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/e53c8d5f1bc6239cc45d4bbd83619c950b481333))
* Show insufficient loa error on download data HP-2268 ([4ed35ff](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/4ed35ff2c58a5f114d8caff2ec8eb5330f4fc3b9))
* Show insufficient loa error on remove service connection and delete profile HP-2268 ([f6890c5](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/f6890c52641ab99d657ded2ddecc5f34f32c40f7))
* Update max length of name fields ([f456744](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/f45674491c882e27b8727fc6b5df56b43ca0e2b0))

## [1.7.0](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.6.0...open-city-profile-ui-v1.7.0) (2024-04-04)


### Features

* About page HP-2259 ([22a5a66](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/22a5a66fccef286da370ad8b6c9aa74b56f89b3f))


### Bug Fixes

* Page title ([22a5a66](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/22a5a66fccef286da370ad8b6c9aa74b56f89b3f))
* Pr comments ([22a5a66](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/22a5a66fccef286da370ad8b6c9aa74b56f89b3f))
* Text href ([22a5a66](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/22a5a66fccef286da370ad8b6c9aa74b56f89b3f))
* Update lang files ([22a5a66](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/22a5a66fccef286da370ad8b6c9aa74b56f89b3f))

## [1.6.0](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.5.1...open-city-profile-ui-v1.6.0) (2024-03-25)


### Features

* Add latest favicons from HDS HP-2313 ([14404c9](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/14404c9541f9f00e8e5bc8b04c63e3d5ca32f1dc))

## [Unreleased]

## [1.1.3] - 2021-02-03
### Fixed
- Broken privacy policy link

## [1.1.0] - 2020-08-25
### Added
- Support for authorization code generation for GDPR API related calls (profile download and deletion) [#108](https://github.com/City-of-Helsinki/open-city-profile-ui/pull/108)
- Link to authentication method account management [#114](https://github.com/City-of-Helsinki/open-city-profile-ui/pull/114)
- Managing multiple addresses
- Managing multiple phone numbers
- Favicon

### Changed
- Better postal code validation
- Removed drop shadows
- Replaced custom select boxes with HDS Dropdown

### Fixed
- Focus indicator being partially hidden with elements used for downloading and deleting profile
- Notifications rendering on top of each other
- Order and visibility of language options
- Several issues with layout, scaling etc
- Text fixes

## [1.0.0-rc.1]
