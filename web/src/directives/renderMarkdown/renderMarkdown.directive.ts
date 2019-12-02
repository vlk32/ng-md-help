import {Directive, Input, Optional, ElementRef, OnChanges, SimpleChanges, PLATFORM_ID, Inject, HostListener} from "@angular/core";
import {isPlatformBrowser, DOCUMENT} from "@angular/common";
import {Router, ActivatedRoute} from "@angular/router";
import {GlobalNotificationsService} from "@anglr/notifications";
import {nameof} from "@jscrpt/common";

import {HelpService} from "../../services/help.service";
import {renderMarkdown, handleHelpServiceError, handleRouterLink} from "../../misc/utils";

/**
 * Directive that renders markdown inside
 */
@Directive(
{
    selector: '[renderMarkdown]'
})
export class RenderMarkdownDirective implements OnChanges
{
    //######################### private fields #########################

    /**
     * Indication whether is code running in browser
     */
    private _isBrowser: boolean = isPlatformBrowser(this._platformId);

    //######################### public properties - inputs #########################

    /**
     * Markdown string to be rendered
     */
    @Input()
    public renderMarkdown: string;

    /**
     * Source string, used for obtaining markdown, using help service
     */
    @Input()
    public source: string;

    /**
     * Base url for md
     */
    @Input()
    public baseUrl: string;

    /**
     * Path for static assets
     */
    @Input()
    public assetsPathPrefix: string = 'dist/md';

    //######################### public methods - host #########################

    /**
     * Process click for anchors
     * @param target Target that was clicked
     */
    @HostListener('click', ['$event'])
    public processClick(target: MouseEvent)
    {
        return handleRouterLink(target, this._router);
    }

    //######################### constructor #########################
    constructor(@Optional() private _helpSvc: HelpService,
                private _element: ElementRef<HTMLElement>,
                private _router: Router,
                private _route: ActivatedRoute,
                @Optional() protected _notifications: GlobalNotificationsService,
                @Inject(DOCUMENT) protected _document: HTMLDocument,
                @Inject(PLATFORM_ID) private _platformId: Object)
    {
    }

    //######################### public methods - implementation of OnChanges #########################
    
    /**
     * Called when input value changes
     */
    public ngOnChanges(changes: SimpleChanges): void
    {
        //renders markdown provided, more priority
        if(nameof<RenderMarkdownDirective>('renderMarkdown') in changes && this.renderMarkdown)
        {
            this._renderMarkdown(this.renderMarkdown);
        }

        //uses source for obtaning markdown
        if(nameof<RenderMarkdownDirective>('source') in changes && this.source && !this.renderMarkdown)
        {
            this._loadMarkdown();
        }
    }

    //######################### public methods #########################

    /**
     * Redirects to not found page
     */
    public showNotFound(): void
    {
    }

    /**
     * Filters out parts of markdown that should not be processed
     * @param md Markdown to be filtered
     */
    public filterMd(md: string): Promise<string>
    {
        return Promise.resolve(md);
    }

    /**
     * Filters out parts of html that should not be rendered
     * @param html Html to be filtered
     */
    public filterHtml(html: string): Promise<string>
    {
        return Promise.resolve(html);
    }

    //######################### private methods #########################

    /**
     * Loads markdown using source
     */
    private _loadMarkdown()
    {
        if(!this.source || !this._helpSvc)
        {
            return;
        }

        this._helpSvc.get(this.source)
            .pipe(handleHelpServiceError(this.showNotFound.bind(this), this._notifications))
            .subscribe(content => this._renderMarkdown(content));
    }

    /**
     * Renders markdown
     * @param markdown Markdown to be rendered
     */
    private async _renderMarkdown(markdown: string)
    {
        this._element.nativeElement.innerHTML = await this.filterHtml(renderMarkdown(await this.filterMd(markdown), this._router, this._route, this.baseUrl, this.assetsPathPrefix));

        this._scrollIntoView();
    }

    /**
     * Scrolls into view fragment element
     */
    private _scrollIntoView()
    {
        if(this._isBrowser && this._route.snapshot.fragment)
        {
            let element = this._document.getElementById(this._route.snapshot.fragment);

            if(element)
            {
                element.scrollIntoView({behavior: "smooth"});
            }
        }
    }
}