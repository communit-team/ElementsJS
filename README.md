# ElementsJS
A lightweight DOM Manipulation library for VanillaJS

## Introduction
ElementsJS is a lightweight jquery-like library for simplifying DOM Manipulation
in Vanilla JS code-bases. Unlike jQuery, it only extends the behaviour of basic
Javascript functionality, without adding any middleware components.  

##### Advantages
- Lightweight (5.8K minified)
- Syntax identical to jQuery
- Supports chaining method calls
- Simplifies event-listener management
- Works with any JS flavor or library
- Easily Extensible

## Usage

```
<script src="https://cdn.jsdelivr.net/gh/communit-team/ElementsJS@main/dist/elements.min.js"></script>
```

## Examples

##### Create Basic Div Element

```
let $el = Div().addClass('my-div').attr('id', 'hello-world').html("Hello World");
```

##### Create Custom Element

```
let $el = El('a').attr('src', '/my/path').html("Click Me");
```

##### Listen to Event

```
let $el = Div().addClass('my-div');
 
$el.on('event-triggered', (e) => { // DO SOMETHING });
 
$el.dispatch('event-triggered', {data: "success"});
```

##### Manipulate DOM Structure

```
let $el = Div().addClass('my-div').attr('id', 'hello-world');
let $title = Span().addClass('title').html('My Title');
let $text = Span().addClass('text').text('My Text');
 
$el.html($title).append($text);
```


##### Query DOM Elements

```
let $el = Div().addClass('my-div').attr('id', 'hello-world');
let $title = Span().addClass('title').html('My Title');
let $text = Span().addClass('text').text('My Text');
 
$el.html($title).append($text);

// query title in parent Element
El('.title', $el)
 
// query title in body
El('.title')
```

##### Use with Vanilla JS

```
// create a pure JS element
let $el = document.createElement('div')
 
// create an ElementsJS element
let $title = Span().addClass('title').html('My Title');

// apply ElementJS methods and elements to vanilla JS
$el.html($title).addClass('some-class some-other-class').addClass('another-class');

```

##### Create your own Elements

```
const Icon = function(v) { return El('i').addClass('icon').attr('data-icon-type', v); }
 
// create element
let icon = Icon('arrow-up')
 
// get data-icon-type 
icon.dataset.iconType
```

##### Extend Elements

```
const IconBig = function(v) { return Icon(v).addClass('icon-big') };
```
