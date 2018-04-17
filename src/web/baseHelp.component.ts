import {AfterViewInit, ElementRef, ViewChild, HostListener, Inject, PLATFORM_ID, Optional} from "@angular/core";
import {isPlatformBrowser, DOCUMENT} from "@angular/common";
import {ActivatedRoute, Router, UrlSegment} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {GlobalNotificationsService} from "@anglr/notifications";
import {catchError} from 'rxjs/operators';
import {empty} from 'rxjs/observable/empty';
import * as marked from 'marked';
import * as highlightjs from 'highlight.js';

import {HelpService} from "./help.service";

//TODO - solve loading anchor based on URL when first displayed #blabla

/**
 * Base component for displaying help pages
 */
export abstract class BaseHelpComponent implements AfterViewInit
{
    //######################### protected fields #########################

    /**
     * Indication whether is code running in browser
     */
    protected _isBrowser: boolean = isPlatformBrowser(this._platformId);

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
            if(this._renderContent)
            {
                this._renderContent(url);
            }
        });
    }

    //######################### public methods #########################

    /**
     * Process click for anchors
     * @param {HTMLAnchorElement} target Target that was clicked
     */
    @HostListener('click', ['$event.target'])
    public processClick(target: HTMLAnchorElement)
    {
        //not anchor
        if(target.nodeName != "A")
        {
            return true;
        }

        //absolute url or contains fragment to same page
        if(target.attributes['href'].value.indexOf('http') >= 0 || target.attributes['href'].value.indexOf(`${this._router.url}#`) >= 0)
        {
            return true;
        }

        this._router.navigateByUrl(target.attributes['href'].value);

        return false;
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

        let renderer = new marked.Renderer();

        // Override function
        renderer.heading = (text: string, level: number, _raw: string) =>
        {
            var escapedText = text.toLowerCase().replace(/[\s]+/g, '-');
  
            return `<h${level} id="${escapedText}">${text}</h${level}>`;
        };

        renderer.link = (href: string, _title: string, text: string) =>
        {
            if(href.indexOf('http') < 0 && href.indexOf('#') < 0)
            {
                href = `rozne/help${href.replace('.md', '')}`;
            }

            if(href.indexOf('#') >= 0)
            {
                if(href.indexOf('.md') >= 0)
                {
                    href = this._router.serializeUrl(this._router.createUrlTree([this._getRouteUrl(href)], {fragment: href.replace(/^.*?#(.*?)$/, '$1')}));
                }
                else
                {
                    href = this._router.serializeUrl(this._router.createUrlTree(['.'], {fragment: href.replace('#', ''), relativeTo: this._route}));
                }
            }

            return `<a href="${href}">${text}</a>`;
        };

        renderer.code = function(code: string, language: string) 
        {
            return `<pre><code class="${language}">${highlightjs.highlight(language, code).value}</code></pre>`;
        };

        renderer.image = (href: string, _title: string, text: string) =>
        {
            if(href.indexOf('http') > -1 || href.indexOf("data:image") > -1)
            {
                return `<img src="${href}" alt="${text}">`;
            }

            return `<img src="dist/md${href}" alt="${text}">`;
        };

        this._helpSvc.get(parsedUrl)
            .pipe(catchError((err: HttpErrorResponse) =>
            {
                if (err.error instanceof Error) 
                {
                    if(this._notifications)
                    {
                        this._notifications.error(`An error occurred: ${err.error.message}`);
                    }
                }
                else
                {
                    if(err.status == 404)
                    {
                        this._showNotFound();
                    }
                    else
                    {
                        if(this._notifications)
                        {
                            this._notifications.error(`An error occurred: ${err.error}`);
                        }
                    }
                }

                return empty<string>();
            }))
            .subscribe(content =>
            { 
                this.content.nativeElement.innerHTML = marked.parse(content, {renderer: renderer});

                this._scrollIntoView();
            });
    }

    /**
     * Gets href url for url to different .md with fragment 
     * @param {string} href Href for anchor
     */
    protected abstract _getRouteUrl(href: string);

    /**
     * Redirects to not found page
     */
    protected abstract _showNotFound();

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