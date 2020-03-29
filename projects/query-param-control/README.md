# Query Param Control Directive

## Description

`queryParamControl` is an Angular directive that allows for the automatic setting of the router system queryParams from HTML form elements or from Reactive Form Controls.

## Setup

`npm install query-param-control`

or

`yarn add query-param-control`

## How to use

[Example Code Project](https://github.com/zjkipping/query-param-control-directive/tree/master/projects/demo)

Import `QueryParamControlModule` into your application

```typescript

@NgModule({
  declarations: [...],
  imports: [
    ...,
    QueryParamControlModule
  ],
  bootstrap: [...]
})
export class AppModule {}

```

This directive relies on the RouterModule being setup & used inside your application. This will not work if you don't have routing setup.

Add the `queryParamsControl` directive to the element you want bound to your queryParams

Pass in the `paramKey` input value. This is a required input on the directive. This will be the key for the input's value in the URL.

HTML Form Element Example:

```html
<input queryParamsControl paramKey="filter" />
```

Reactive Form Control Example:

```html
<input [formControl]="fooControl" queryParamsControl paramKey="filter" />
```

You can override the value for the `mergeParam` input which defaults to `true`. This means the element's param will merge with other Query Params.
If you set this to `false` it will wipe out all the other Query Params it is set.

## Current Limitations | TODO

Currently the directive doesn't work great with checkbox groups that have more than 1 initially default checked input.
