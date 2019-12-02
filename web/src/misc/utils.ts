import {Router, ActivatedRoute} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {MonoTypeOperatorFunction, Observable, empty} from 'rxjs';
import {catchError} from 'rxjs/operators';
import * as marked from 'marked';
import * as highlightjs from 'highlight.js';
import {GlobalNotificationsService} from '@anglr/notifications';

/**
 * Renders markdown to html
 * @param markdown Markdown that will be rendered to html
 * @param router Angular router used for generating links
 * @param route Current route used during generation of relative links
 * @param baseUrl Base url used for routing links
 * @param assetsPathPrefix Path for static assets
 */
export function renderMarkdown(markdown: string, router: Router, route: ActivatedRoute, baseUrl: string, assetsPathPrefix: string = 'dist/md'): string
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
        if(href.indexOf('http') < 0 && href.indexOf('#') < 0)
        {
            href = `${baseUrl}${href.replace('.md', '')}`;
        }

        if(href.indexOf('#') >= 0)
        {
            if(href.indexOf('.md') >= 0)
            {
                href = router.serializeUrl(router.createUrlTree([`/${baseUrl}${href.replace(/^(.*?)\.md.*?$/, "$1")}`], {fragment: href.replace(/^.*?#(.*?)$/, '$1')}));
            }
            else
            {
                href = router.serializeUrl(router.createUrlTree(['.'], {fragment: href.replace('#', ''), relativeTo: route}));
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

        return `<img src="${assetsPathPrefix}${href}" alt="${text}">`;
    };

    return marked.parse(markdown, {renderer: renderer});
}

/**
 * Handles click event
 * @param event Mouse event that occured
 * @param router Router that is used for changing url
 */
export function handleRouterLink(event: MouseEvent, router: Router)
{
    let target = event.target as HTMLElement;

    //not anchor
    if(target.nodeName != "A")
    {
        return true;
    }

    //absolute url or contains fragment to same page
    if(target.attributes['href'].value.indexOf('http') >= 0 || target.attributes['href'].value.indexOf(`${router.url}#`) >= 0)
    {
        return true;
    }

    router.navigateByUrl(target.attributes['href'].value);

    event.preventDefault();
    event.stopPropagation();

    return false;
}

/**
 * Handles help service error
 * @param showNotFound Method used for displaying not found
 * @param notifications Service used for notifications
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