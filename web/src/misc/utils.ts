import {Router, ActivatedRoute, NavigationExtras} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {GlobalNotificationsService} from '@anglr/notifications';
import {isBlank} from '@jscrpt/common';
import {MonoTypeOperatorFunction, Observable, empty} from 'rxjs';
import {catchError} from 'rxjs/operators';
import * as marked from 'marked';
import * as highlightjs from 'highlight.js';

/**
 * Renders markdown to html
 * @param markdown - Markdown that will be rendered to html
 * @param router - Angular router used for generating links
 * @param route - Current route used during generation of relative links
 * @param baseUrl - Base url used for routing links
 * @param assetsPathPrefix - Path for static assets
 */
export function renderMarkdown(markdown: string, router: Router, route: ActivatedRoute, baseUrl: string = "", assetsPathPrefix: string = 'dist/md'): string
{
    let renderer = new marked.Renderer();

    // Override function
    renderer.heading = (text: string, level: number, _raw: string) =>
    {
        var escapedText = text.toLowerCase().replace(/[\s]+/g, '-');

        return `<h${level} id="${escapedText}">${text}</h${level}>`;
    };

    renderer.link = (href: string, _title: string, text: string) =>
    {
        //internal links containing .md are replaced
        if(href.indexOf('http') !== 0)
        {
            href = href.replace(/\.md($|#)/gm, '$1');
            href = href.replace(/^\.\//gm, '../');

            let routeParams: NavigationExtras = {};

            //handle fragment
            if(href.indexOf('#') >= 0)
            {
                routeParams.fragment = href.replace(/^.*?#/gm, '');
            }

            //handle relative links
            if(href.startsWith('../'))
            {
                routeParams.relativeTo = route;

                href = router.serializeUrl(router.createUrlTree([href.replace(/#.*?$/gm, '')], routeParams));
            }
            else
            {
                href = router.serializeUrl(router.createUrlTree([`${baseUrl}${href.replace(/#.*?$/gm, "")}`], routeParams));
            }
        }

        return `<a href="${href}">${text}</a>`;
    };

    renderer.code = function(code: string, language: string)
    {
        return `<pre><code class="hljs ${language}">${highlightjs.highlight(language, code).value}</code></pre>`;
    };

    renderer.image = (href: string, _title: string, text: string) =>
    {
        if(href.indexOf('http') === 0 || href.indexOf("data:image") > -1)
        {
            return `<img src="${href}" alt="${text}">`;
        }

        return `<img src="${assetsPathPrefix}${href}" alt="${text}">`;
    };

    return marked.parse(markdown, {renderer: renderer});
}

/**
 * Handles click event
 * @param event - Mouse event that occured
 * @param router - Router that is used for changing url
 */
export function handleRouterLink(event: MouseEvent, router: Router, document: HTMLDocument)
{
    let target = event.target as HTMLElement;

    //not anchor
    if(target.nodeName != "A" || isBlank(target.attributes['href']?.value))
    {
        return true;
    }

    let href: string = target.attributes['href'].value;
    let currentUrl = getCurrentUrlPrefix(document);
    href = href.replace(new RegExp(`^${currentUrl}`), "");

    //absolute url to different page
    if(href.indexOf('http') === 0)
    {
        return true;
    }

    let parsedUrl = router.parseUrl(href);

    router.navigateByUrl(parsedUrl).then(() =>
    {
        //scroll into view
        if(parsedUrl.fragment)
        {
            document.querySelector(`#${parsedUrl.fragment}`)?.scrollIntoView({behavior: "smooth"});
        }
    });

    event.preventDefault();
    event.stopPropagation();

    return false;
}

/**
 * Gets current URL prefix (contains protocol and host)
 * @param document - Html document to be used for computation of current URL prefix
 */
export function getCurrentUrlPrefix(document: HTMLDocument): string
{
    return `${document.location.protocol}//${document.location.host}`;
}

/**
 * Handles help service error
 * @param showNotFound - Method used for displaying not found
 * @param notifications - Service used for notifications
 */
export function handleHelpServiceError(showNotFound: () => void, notifications: GlobalNotificationsService): MonoTypeOperatorFunction<string|null>
{
    return (source: Observable<string|null>) =>
    {
        return source.pipe(catchError((err: HttpErrorResponse) =>
        {
            if (err.error instanceof Error)
            {
                if(notifications)
                {
                    notifications.error(`An error occurred: ${err.error.message}`);
                }
            }
            else
            {
                if(err.status == 404)
                {
                    showNotFound();
                }
                else
                {
                    if(notifications)
                    {
                        notifications.error(`An error occurred: ${err.error}`);
                    }
                }
            }

            return empty();
        }));
    };
}