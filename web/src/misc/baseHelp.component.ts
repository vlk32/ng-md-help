import {AfterViewInit, ElementRef, ViewChild, HostListener, Inject, PLATFORM_ID, Optional, Directive} from "@angular/core";
import {isPlatformBrowser, DOCUMENT} from "@angular/common";
import {ActivatedRoute, Router, UrlSegment} from "@angular/router";
import {GlobalNotificationsService} from "@anglr/notifications";

import {HelpService} from "../services/help.service";
import {renderMarkdown, handleRouterLink, handleHelpServiceError} from "./utils";

//TODO - solve loading anchor based on URL when first displayed #blabla

/**
 * Base component for displaying help pages
 */
@Directive()
export abstract class BaseHelpComponent implements AfterViewInit
{
    //######################### protected fields #########################

    /**
     * Indication whether is code running in browser
     */
    protected _isBrowser: boolean = isPlatformBrowser(this._platformId);

    /**
     * Base url for md
     */
    protected _baseUrl: string = "";

    /**
     * Path for static assets
     */
    protected _assetsPathPrefix: string = 'dist/md';

    //######################### public properties - children #########################

    /**
     * Div that is used for displaying content
     */
    @ViewChild('content')
    public content: ElementRef;

    //######################### constructor #########################
    constructor(protected _route: ActivatedRoute,
                protected _helpSvc: HelpService,
                protected _router: Router,
                @Optional() protected _notifications: GlobalNotificationsService,
                @Inject(DOCUMENT) protected _document: HTMLDocument,
                @Inject(PLATFORM_ID) protected _platformId: Object)
    {
    }

    //######################### public methods - implementation of AfterViewInit #########################

    /**
     * Called when view was initialized
     */
    public ngAfterViewInit()
    {
        this._route.url.subscribe(url =>
        {
            if(this.content)
            {
                this._renderContent(url);
            }
        });
    }

    //######################### public methods #########################

    /**
     * Process click for anchors
     * @param target - Target that was clicked
     */
    @HostListener('click', ['$event'])
    public processClick(target: MouseEvent)
    {
        return handleRouterLink(target, this._router, this._document);
    }

    //######################### protected methods #########################

    /**
     * Renders content
     */
    protected _renderContent(url: UrlSegment[])
    {
        let parsedUrl = url.map(url => url.path).join("/");

        if(!parsedUrl)
        {
            this._showNotFound();
        }

        this._helpSvc.get(parsedUrl)
            .pipe(handleHelpServiceError(this._showNotFound.bind(this), this._notifications))
            .subscribe(async content =>
            {
                this.content.nativeElement.innerHTML = await this._filterHtml(renderMarkdown(await this._filterMd(content), this._router, this._route, this._baseUrl, this._assetsPathPrefix));

                this._scrollIntoView();
            });
    }

    /**
     * Redirects to not found page
     */
    protected abstract _showNotFound();

    /**
     * Filters out parts of markdown that should not be processed
     * @param md - Markdown to be filtered
     */
    protected _filterMd(md: string): Promise<string>
    {
        return Promise.resolve(md);
    }

    /**
     * Filters out parts of html that should not be rendered
     * @param html - Html to be filtered
     */
    protected _filterHtml(html: string): Promise<string>
    {
        return Promise.resolve(html);
    }

    /**
     * Scrolls into view fragment element
     */
    protected _scrollIntoView()
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