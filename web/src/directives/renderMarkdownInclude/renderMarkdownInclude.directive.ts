import {Directive, Optional, ElementRef, Inject, PLATFORM_ID} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {GlobalNotificationsService} from '@anglr/notifications';

import {RenderMarkdownDirective} from '../renderMarkdown/renderMarkdown.directive';
import {HelpService} from '../../services/help.service';

/**
 * Directive used for custom rendering of markdown with support of INCLUDEMD syntax
 */
@Directive(
{
    selector: "[renderMdInclude]"
})
export class RenderMarkdownIncludeDirective extends RenderMarkdownDirective
{
    //######################### constructor #########################
    constructor(@Optional() helpSvc: HelpService,
                element: ElementRef<HTMLElement>,
                router: Router,
                route: ActivatedRoute,
                @Optional() notifications: GlobalNotificationsService,
                @Inject(DOCUMENT) document: HTMLDocument,
                @Inject(PLATFORM_ID) platformId: Object,
                protected _http: HttpClient)
    {
        super(helpSvc, element, router, route, notifications, document, platformId);
    }

    //######################### public methods #########################

    /**
     * Filters out parts of markdown that should not be processed
     * @param md - Markdown to be filtered
     */
    public async filterMd(md: string): Promise<string>
    {
        let matches: RegExpExecArray;

        while(matches = /@INCLUDEMD#(.*?)@/.exec(md))
        {
            let includeMd = await this._http.get(matches[1], {responseType: 'text'}).toPromise();

            md = md.replace(/@INCLUDEMD#(.*?)@/, includeMd);
        }

        return md;
    }
}