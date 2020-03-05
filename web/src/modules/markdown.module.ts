import {NgModule} from '@angular/core';

import {RenderMarkdownDirective} from '../directives/renderMarkdown/renderMarkdown.directive';
import {RenderMarkdownIncludeDirective} from '../directives/renderMarkdownInclude/renderMarkdownInclude.directive';
import {MdMenuItemDirective} from '../directives/mdMenuItem/mdMenuItem.directive';
import {MdMenuComponent} from '../components/mdMenu/mdMenu.component';

/**
 * Module used for processing markdown
 */
@NgModule(
{
    declarations:
    [
        RenderMarkdownDirective,
        RenderMarkdownIncludeDirective,
        MdMenuComponent,
        MdMenuItemDirective
    ],
    exports:
    [
        RenderMarkdownDirective,
        RenderMarkdownIncludeDirective,
        MdMenuComponent,
        MdMenuItemDirective
    ]
})
export class MarkdownModule
{
}