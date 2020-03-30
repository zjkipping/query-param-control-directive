# Query Param Control Directive

## Description

`queryParamControl` is an Angular directive that allows for the automatic setting of the router system queryParams from HTML form elements or from Reactive Form Controls.

## Setup

`npm install query-param-control`

or

`yarn add query-param-control`

## How to use

[Example Code Project](https://github.com/zjkipping/query-param-control-directive/tree/master/projects/demo)

### Module Import

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

You can override the value for the `mergeParam` input which defaults to `true`. This means the element's param will merge with other Query Params.
If you set this to `false` it will wipe out all the other Query Params it is set.

For Checkbox Groups you will need to put the `queryParamsControl` & `paramKey` input onto an element that contains the checkbox inputs.
You will also need to set the `checkboxGroup` input to `true`.
The checkbox inputs will need to have a `queryParamCheckbox` directive attached to them.
The checkbox specific directive may go away when this Angular functionality is finished: https://github.com/angular/angular/issues/8563

### Utility

All values being plugged in for the queryParams are run through a `JSON.stringify` and then `decodeURIComponent`.

`decodeValueFromUrl` is provided by the package to reverse this process for any given queryParam value.

### HTML Form Element Example (see below for checkbox group caveat)

```html
<input queryParamControl paramKey="filter" />
```

### HTML Form Checkbox Group

```html
<ng-container queryParamControl paramKey="colors" [checkboxGroup]="true">
  <input type="checkbox" value="red" queryParamCheckbox />
  <input type="checkbox" value="blue" queryParamCheckbox />
  <input type="checkbox" value="green" queryParamCheckbox />
</ng-container>
```

### Reactive Form Control Example

```html
<app-custom-select-element
  label="Favorite Foods"
  [options]="foods"
  [formControl]="foodsControl"
  queryParamControl
  paramKey="food"
></app-custom-select-element>
```
