import {Directive, Input, Optional, ElementRef, OnChanges, SimpleChanges} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {nameof} from "@jscrpt/common";

import {HelpService} from "../../services/help.service";
import {renderMarkdown} from "../../misc/utils";

/**
 * Directive that renders markdown inside
 */
@Directive(
{
    selector: '[renderMarkdown]'
})
export class RenderMarkdownDirective implements OnChanges
{
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

    //######################### constructor #########################
    constructor(@Optional() private _helpSvc: HelpService,
                private _element: ElementRef<HTMLElement>,
                private _router: Router,
                private _route: ActivatedRoute)
    {
        console.log(this._helpSvc);
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

        }
    }

    //######################### private methods #########################

    /**
     * Renders markdown
     * @param markdown Markdown to be rendered
     */
    private async _renderMarkdown(markdown: string)
    {
        this._element.nativeElement.innerHTML = await this._filterHtml(renderMarkdown(await this._filterMd(markdown), this._router, this._route, this.baseUrl, this.assetsPathPrefix));
    }

    //######################### protected methods #########################

    /**
     * Redirects to not found page
     */
    protected _showNotFound(): void
    {
    }

    /**
     * Filters out parts of markdown that should not be processed
     * @param md Markdown to be filtered
     */
    protected _filterMd(md: string): Promise<string>
    {
        return Promise.resolve(md);
    }

    /**
     * Filters out parts of html that should not be rendered
     * @param html Html to be filtered
     */
    protected _filterHtml(html: string): Promise<string>
    {
        return Promise.resolve(html);
    }
}