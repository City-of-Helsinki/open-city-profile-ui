# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

## [1.12.0](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.11.1...open-city-profile-ui-v1.12.0) (2024-06-12)


### Features

* Update accessibility document ([#363](https://github.com/City-of-Helsinki/open-city-profile-ui/issues/363)) ([6445eaa](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/6445eaa3d94dea5b7b2b4742364dc0d74536bda9))

## [1.11.1](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.11.0...open-city-profile-ui-v1.11.1) (2024-06-11)


### Bug Fixes

* Update the user guide ([#361](https://github.com/City-of-Helsinki/open-city-profile-ui/issues/361)) ([0374d1e](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/0374d1e483ecb846948af62dbdfe24b55da5ecf4))

## [1.11.0](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.10.2...open-city-profile-ui-v1.11.0) (2024-06-07)


### Features

* Add user guide HP-2322 ([#352](https://github.com/City-of-Helsinki/open-city-profile-ui/issues/352)) ([e6dc4b6](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/e6dc4b68715e0670d1d281c406b87d16a72b2ebb))
* Footer add Helsinki profile support information HP-2459 ([04a1954](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/04a19542a640c231af35ca401e986485052ddcec))


### Bug Fixes

* Remove guide link from footer base HP-2459 ([87cf386](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/87cf38697b45603a808a187f125695bd9d6fa486))

## [1.10.2](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.10.1...open-city-profile-ui-v1.10.2) (2024-06-06)


### Bug Fixes

* Oidc don't filter protocol claims HP-2463 ([912db76](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/912db76179086810f19a22fff46ac8b9d40865b5))

## [1.10.1](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.10.0...open-city-profile-ui-v1.10.1) (2024-06-05)


### Bug Fixes

* Revert react and react-dom to 16.13.1 ([b255319](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/b2553191562e82ee5ca79b29e470c6e2d4f54273))

## [1.10.0](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.9.1...open-city-profile-ui-v1.10.0) (2024-05-23)


### Features

* Remove all adresses/phonenumbers when one is removed HP-2338 ([#349](https://github.com/City-of-Helsinki/open-city-profile-ui/issues/349)) ([17d6d5d](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/17d6d5d17636c66bf4ab3aeca8bd5460bf8bc43f))


### Bug Fixes

* Fixing useProfileLoadTracker tests HP-2436 ([2fcc8db](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/2fcc8db6d66f71aa4d83fa5aab70fe3f2249530c))


### Dependencies

* Patch braces to 3.0.3 via resolutions HP-2436 ([893a14d](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/893a14d48d4bc2651eca8e132364c13817392527))
* Patch micromatch to 4.0.6 via resolutions HP-2436 ([d9ac02c](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/d9ac02cbbd9d00cc18d6d576f9ae7e2c8c78cf3a))
* Remove deprecated packages HP-2436 ([4735110](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/4735110cea213fca9d493c7f03dd7e7d5d88d63d))
* Replace oidc-client with oidc-client-ts@2.4.0 HP-2436 ([8397a05](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/8397a05247e95236c9b81dc7f5d405de5783dc17))
* Upgrade hds-core hds-design-tokens hds-react to 3.8.0 HP-2436 ([ec44d1a](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/ec44d1aa941435c4456192a3eb6a41556abf8de9))
* Upgrade vite to 5.2.11 HP-2436 ([c748e9a](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/c748e9aff5ee2a44ee08a2e4e13f901f365123c5))

## [1.9.1](https://github.com/City-of-Helsinki/open-city-profile-ui/compare/open-city-profile-ui-v1.9.0...open-city-profile-ui-v1.9.1) (2024-05-15)


### Bug Fixes

* ParseGraphQLError default should return falsy props HP-2435 ([6e0426b](https://github.com/City-of-Helsinki/open-city-profile-ui/commit/6e0426b73aba8bf4798857f7f1704d30ed516b01))

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
