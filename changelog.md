# Changelog

## Version 7.0.1

- added `RenderMarkdownIncludeDirective` supporting import of another markdowns (one level)
- fixed `handleRouterLink`, now checks *anchors* only with `href` attribute

## Version 7.0.0

- updated to latest stable *Angular* 9
- added generating of API doc

## Version 6.0.2

- added new component `MdMenuComponent` allowing to create *markdown* menu, used together with `RenderMarkdownDirective`
- added new directive `MdMenuItemDirective` allowing to tag html element as navigation element in *markdown* pages
- added new directive `RenderMarkdownDirective` that can be used for rendering markdown

## Version 6.0.1

- added protected `_baseUrl` property to `BaseHelpComponent` for href resolving in md files

## Version 6.0.0

- Angular IVY ready (APF compliant package)
- added support for ES2015 compilation
- Angular 8

## Version 5.0.2
- added protected `_filterMd` method to `BaseHelpComponent` for filtering markdown input

## Version 5.0.1
 - added protected `_filterHtml` method to `BaseHelpComponent` for filtering markdown html result

## Version 5.0.0
 - `@anglr/md-help` is now marked as *sideEffects* free
 - stabilized for angular v6

## Version 5.0.0-beta.1
 - aktualizácia balíčkov `Angular` na `6`
 - aktualizácia `Webpack` na verziu `4`
 - aktualizácia `rxjs` na verziu `6`

## Version 4.0.0
- basic class for help component
- help methods for gulp transformation into static html

