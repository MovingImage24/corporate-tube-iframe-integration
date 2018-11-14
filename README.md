# iFrame Integration

## Parent page (_page which integrates ct iframe_)

* We provide an encapsulated integration through the client library `embed.js` 
* Files:
```
dist/
  - _languageData.js
  - guessLanguage.js
  - embed.js
```
* Parent page should include the files in preserved order into the header section.
* Parent page should provide a DIV element in which the iframe will be placed. 
* DIV element **must** have `id` which will be later on configured.

## Example of implementation:

### URL Structure

Suggested integrator web page URL schema:
> `https://example.com/videos` + `/channel/83281271/hr/video/23492348`

The first part of URL `https://example.com/videos` is part under control of the parent page which integrates the CT iFrame - let's call it from now on `Parent frame`.

The second part of the URL `/channel/83281271/hr/video/23492348` will be proxied to iFrame as CT resource allocation url. Let's call it from now on `Child frame`.

#### Important !!!!
> _The url `https://example.com/videos/channel/83281271/hr/video/23492348` in integration portal must always load `baseUrl` `https://example.com/videos` and DO NOT interpret right side of the URL `/channel/83281271/hr/video/23492348`. Right side of url should be completely ignored by routing. 
For applications with routed systems it should not be a problem `(regex example: /^\/videos.*$/)`._

#### How Frames should looks in code:

```
<!-- This is Parent frame-->
<html lang="en">
    <body>
        <div id="ct-frame-wrapper">
            <!-- This is CT Child frame-->
            <iframe src="......"></iframe>
        </div>
    </body>
</html>
```

<div class="page" />

#### Integration codding part
```html
<html lang="en">
    <head>
        <script src="/static/_languageData.js"></script>
        <script src="/static/guessLanguage.js"></script>
        <script src="/static/embed.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function () {
                var baseUrl = "https://example.com/videos";
                var ctUrl = "https://example.corporate.tube";
                var ctEmbedded = new CtEmbedded(
                    {
                        baseUrl: baseUrl, 
                        wrapperId: "ct-frame-wrapper"
                    },
                    ctUrl
                );

                ctEmbedded.subscribe(function(exchangeMessage) {
                    // This line add changed ct iframe route to parent website integration page
                    // In the other words end user will be able to copy url and send to someone in order to share ct deep linkable content
                    history.replaceState(history.state, "iframe", baseUrl + exchangeMessage.routeChanged);
                });
            });
        </script>
    </head>
    <body>
        <div id="ct-frame-wrapper"></div>
    </body>
</html>
```

<div class="page" />

**How it works**

* `embed.js` 
    > is the library to be provided to the customer who is going to integrate Corporate Tube into their system as iFrame

* `CtEmbedded` 
    > stands for Corporate Tube Embedded and it is the main object which will create integration.

    **_Important:_**
    > _Don't create iframe html element manually - it will be placed by library into div with `id` `===` `wrapperId` config parameter._
    
    _Configuration options_:
    
    * `baseUrl` _`mandatory`_ - Must be provided and it stands for the url of `Parent Frame` page
    
    * `wrapperId` _`optional`_ - id of wrapper DIV which will hold iframe element. `Default: "ct-frame-wrapper"`

* `<div id="ct-frame-wrapper"></div>` 
    > is wrapper div where the iframe is going to be placed.

* `ctEmbedded.subscribe` 
    > method will receive exchange messages which Corporate Tube `Child Frame` is sending to `Parent Frame`. Usually, messages will contain `newCtRoute`, `newVideoId`, `newChannelId` and other metadata which are to be defined.
