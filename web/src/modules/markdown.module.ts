import {NgModule} from '@angular/core';

import {RenderMarkdownDirective} from '../directives/renderMarkdown/renderMarkdown.directive';

/**
 * Module used for processing markdown
 */
@NgModule(
{
    declarations:
    [
        RenderMarkdownDirective
    ],
    exports:
    [
        RenderMarkdownDirective
    ]
})
export class MarkdownModule
{
}