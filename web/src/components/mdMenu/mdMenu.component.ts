import {Component, ChangeDetectionStrategy, QueryList, ContentChildren, AfterContentInit, OnDestroy, OnInit, ChangeDetectorRef, Input} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";

import {MdMenuItemDirective} from "../../directives/mdMenuItem/mdMenuItem.directive";

/**
 * Component used for gathering mdHelp links
 */
@Component(
{
    selector: 'md-menu',
    templateUrl: 'mdMenu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdMenuComponent implements AfterContentInit, OnDestroy, OnInit
{
    //######################### protected fields #########################

    /**
     * Array of items click subscriptions
     */
    protected _itemsClickSubscriptions: Subscription[] = [];

    /**
     * Subscription for changing route
     */
    protected _routeChangeSubscription: Subscription;

    //######################### public properties #########################

    /**
     * Currently active path that should be displayed
     */
    public activePath: string = '';

    //######################### public properties - inputs #########################

    /**
     * Class used for active element
     */
    @Input()
    public activeCssClass: string = '';

    /**
     * Base url used for route change without navigating
     */
    @Input()
    public baseUrl: string = '/';

    //######################### public properties - children #########################

    /**
     * Array of menu items
     * @internal
     */
    @ContentChildren(MdMenuItemDirective, {descendants: true})
    public items: QueryList<MdMenuItemDirective>;

    //######################### constructor #########################
    constructor(protected _route: ActivatedRoute,
                protected _router: Router,
                protected _changeDetector: ChangeDetectorRef)
    {
    }

    //######################### public methods - implementation of OnInit #########################
    
    /**
     * Initialize component
     */
    public ngOnInit()
    {
        this._routeChangeSubscription = this._route.url.subscribe(url =>
        {
            let parsedUrl = url.map(url => url.path).join("/");

            if(parsedUrl)
            {
                this.activePath = parsedUrl;
                this._changeDetector.markForCheck();
                this._setActiveItem();
            }
        });
    }

    //######################### public methods - implementation of AfterContentInit #########################
    
    /**
     * Called when content was initialized
     */
    public ngAfterContentInit()
    {
        this.items.forEach(item =>
        {
            this._itemsClickSubscriptions.push(item.click.subscribe(() =>
            {
                this._router.navigate([`${this.baseUrl}/${item.mdPath}`]);
            }));
        });

        this._setActiveItem();
    }

    //######################### public methods - implementation of OnDestroy #########################
    
    /**
     * Called when component is destroyed
     */
    public ngOnDestroy()
    {
        this._itemsClickSubscriptions.forEach(subscription =>
        {
            subscription.unsubscribe();
        });

        this._itemsClickSubscriptions = [];

        if(this._routeChangeSubscription)
        {
            this._routeChangeSubscription.unsubscribe();
            this._routeChangeSubscription = null;
        }
    }

    //######################### protected methods #########################

    /**
     * Sets items as active
     */
    protected _setActiveItem()
    {
        if(!this.items || !this.activePath ||!this.activeCssClass)
        {
            return;
        }

        this.items.forEach(item =>
        {
            item.setActive(this.activeCssClass, this.activePath == item.mdPath);
        });
    }
}