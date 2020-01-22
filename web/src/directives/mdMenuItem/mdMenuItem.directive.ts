import {Directive, Input, HostListener, ElementRef} from "@angular/core";
import {Subject, Observable} from "rxjs";

/**
 * Directive used for highligting active menuitem and also reacts to changes of new menuitem selected
 */
@Directive(
{
    selector: '[mdMenuItem]'
})
export class MdMenuItemDirective
{
    //######################### private fields #########################

    /**
     * Subject that is used for emitting click
     */
    private _clickSubject: Subject<void> = new Subject<void>();

    //######################### public properties - inputs #########################

    /**
     * Relative path for markdown file
     */
    @Input('mdMenuItem')
    public mdPath: string;

    //######################### public properties #########################

    /**
     * Occurs when directive is clicked
     */
    public get click(): Observable<void>
    {
        return this._clickSubject.asObservable();
    }

    //######################### constructor #########################
    constructor(private _element: ElementRef<HTMLElement>)
    {
    }

    //######################### public methods - host #########################

    /**
     * Handles click event on element
     * @internal
     */
    @HostListener('click', ['$event'])
    public clickHandler(event: MouseEvent)
    {
        event.preventDefault();
        event.stopPropagation();
        
        this._clickSubject.next();
    }

    //######################### public methods #########################

    /**
     * Sets active css class
     * @param cssClass Css class to be set
     * @param active Indication whether set as active
     */
    public setActive(cssClass: string, active: boolean = true)
    {
        if(active)
        {
            this._element.nativeElement.classList.add(cssClass);
        }
        else
        {
            this._element.nativeElement.classList.remove(cssClass);
        }
    }
}