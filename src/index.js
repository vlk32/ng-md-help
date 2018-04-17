var gulp = require('gulp'),
    marked = require('marked'),
    highlightjs = require('highlight.js'),
    handlebars = require('gulp-compile-handlebars'),
    path = require('path'),
    fs = require('fs'),
    read = require('read-file'),
    file = require('gulp-file'),
    through2 = require('through2'),
    StringDecoder = require('string_decoder').StringDecoder,
    decoder = new StringDecoder('utf8');

var mergingLinks;

//TODO - make scss and all external resources more dynamic 

exports.compileMdToHtml = function compileMdToHtml()
{
    return through2.obj(function(vinyl, enc, callback)
    {
        let renderer = new marked.Renderer();

        renderer.heading = (text, level) =>
        {
            var escapedText = text.toLowerCase().replace(/[\s]+/g, '-');

            return `<h${level} id="${escapedText}">${text}</h${level}>`;
        };

        renderer.image = (href, title, text) =>
        {
            if(href.indexOf('/') == 0)
            {
                href = href.substr(1);
                href = path.relative(path.relative(vinyl.base, path.dirname(vinyl.path)), href);
            }

            return `<img src="${href}" alt="${text}">`;
        };

        renderer.code = function(code, language)
        {
            return `<pre><code class="${language}">${highlightjs.highlight(language, code).value}</code></pre>`;
        };

        var md = decoder.end(vinyl.contents);
        var html = marked.parse(md, {renderer: renderer});
        vinyl.contents = Buffer.from(html);

        callback(null, vinyl);
    });
};

exports.mergeMdLinksInto = function mergeMdLinksInto()
{
    return through2.obj(function(vinyl, enc, callback)
    {
        mergingLinks = {};
        mergingLinks[`/${vinyl.relative}`] = "index";

        var content = decoder.end(vinyl.contents);
        var linkRegex = /\[(.*?)\]\((\/(?:.*?\/)*(.*?)\.md)\)/;
        var linkAnchorRegex = /\[(.*?)\]\(\/(?:.*?)\.md#(.*?)\)/;

        while(linkRegex.test(content))
        {
            let matches = linkRegex.exec(content);
            let filepath = matches[2];
            let filename = matches[3];
            let anchor = filename.toLowerCase().replace(/[\s]+/g, '-');

            if(filepath in mergingLinks)
            {
                anchor = mergingLinks[filepath];
            }
            else
            {
                content += "\n\n";
                content += `<div id="${anchor}"></div>\n\n`;
                content += fs.readFileSync(path.join(vinyl.base, filepath));
                mergingLinks[filepath] = anchor;
            }

            content = content.replace(linkRegex, `[$1](#${anchor})`);
        }

        while(linkAnchorRegex.test(content))
        {
            content = content.replace(linkAnchorRegex, `[$1](#$2)`);
        }

        vinyl.contents = Buffer.from(content);

        callback(null, vinyl);
    });
};

function copyResourcesDefaultCallback(vinyl, buildDir, callback)
{
    gulp.src(`${buildDir}/site.css`)
        .pipe(gulp.dest(`${buildDir}/${path.relative(vinyl.base, path.dirname(vinyl.path))}`))
        .on('finish', function()
        {
            gulp.src(`${buildDir}/external/**/*.*`)
                .pipe(gulp.dest(`${buildDir}/${path.relative(vinyl.base, path.dirname(vinyl.path))}/external`))
                .on('finish', function()
                {
                    gulp.src(`${buildDir}/dist/**/*.*`)
                        .pipe(gulp.dest(`${buildDir}/${path.relative(vinyl.base, path.dirname(vinyl.path))}/dist`))
                        .on('finish', function()
                        {
                            callback(null, vinyl);
                        });
                });
        });
};

exports.prepareHtml = function prepareHtml(buildDir, indexHbsPath, copyResourcesCallback)
{
    if(!copyResourcesCallback)
    {
        copyResourcesCallback = copyResourcesDefaultCallback;
    }

    return through2.obj(function(vinyl, enc, callback)
    {
        file('index.html', decoder.end(read.sync(indexHbsPath)), { src: true })
            .pipe(handlebars({content: decoder.end(vinyl.contents)}))
            .pipe(through2.obj(function(indexVinyl)
            {
                vinyl.contents = indexVinyl.contents;

                if(path.relative(vinyl.base, path.dirname(vinyl.path)).length)
                {
                    copyResourcesCallback(vinyl, buildDir, callback);
                }
                else
                {
                    callback(null, vinyl);
                }
            }));
    });
};

exports.copyResourcesDefaultCallback = copyResourcesDefaultCallback;