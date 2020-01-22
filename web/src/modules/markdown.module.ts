import {NgModule} from '@angular/core';

import {RenderMarkdownDirective} from '../directives/renderMarkdown/renderMarkdown.directive';
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
        MdMenuComponent,
        MdMenuItemDirective
    ],
    exports:
    [
        RenderMarkdownDirective,
        MdMenuComponent,
        MdMenuItemDirective
    ]
})
export class MarkdownModule
{
}