function loadScript(attrs) {
    var script = document.createElement('script');
    script.async = false;

    for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
            script[key] = attrs[key];
        }
    }

    (document.body || document.head).appendChild(script);
}
