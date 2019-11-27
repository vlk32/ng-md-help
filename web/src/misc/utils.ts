import {Router, ActivatedRoute} from '@angular/router';
import * as marked from 'marked';
import * as highlightjs from 'highlight.js';

/**
 * Renders markdown to html
 * @param router Angular router used for generating links
 * @param route Current route used during generation of relative links
 * @param baseUrl Base url used for routing links
 * @param assetsPathPrefix Path for static assets
 */
export function renderMarkdown(router: Router, route: ActivatedRoute, baseUrl: string, assetsPathPrefix: string = 'dist/md')
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
}