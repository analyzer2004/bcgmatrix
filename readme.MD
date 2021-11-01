# BCGMatrix Component
The **BCG Matrix** (aka **Growth-share matrix**) provides a strategic view for analyzing business units, products or services by splitting them into four quadrants according to the growth and relative market share: **question marks**, **stars**, **dogs** and **cows**. Each quadrant has its own set of unique characteristics that represents a certain degree of profitability. This helps companies decide where to focus their resources to generate the most value, as well as where to cut their losses. Below is a brief breakdown of each quadrant:
- **Cows: Low growth, high share**. They are typically the leading products and companies should milk these  **"cash cows"** for cash.
- **Stars: High growth, high share**. Products that are in a fast-growing market and generate the most cash are considered stars and should be invested in more.
- **Question Marks: High grwoth, low share**. Products in this category are growing rapidly but bring little in return and they usually consume significant amount of resoruces. These must be analyzed carefully in order to determine whether they are worth to invest more or should discard.
- **Dogs: Low growth, low share**. Dogs (aka pets) frequently break even, are neither generating nor consuming a large amount of resources. However, they are usually cash traps and ties up investment that could better be untilized elsewhere. Products in this quadrant are candidates for liqudation unless they have some other strategic purpose.

For live demos and sample codes, please see [BCGMatrix Component](https://observablehq.com/@analyzer2004/bcgmatrix)

<img src="https://github.com/analyzer2004/bcgmatrix/blob/master/images/cover.png" width="768">

## API Reference

* **BCGMatrix(data, options, container)** - Constructs a new instance of BCGMatrix with the specified dataset and options. The container is usually a SVG but can be any DOM element as well, and it is optional.
  * **width** - the width of the matrix. Default is 1024.
  * **height** - the height of the matrix. Default is 768.
  * **highlightScope** - sets the highlight scope to *"none"*, *"all"*, *"min"*, *"max"*, *"minMax"*, *"top"*, *"bottom"* or *"topBottom"*. Default is "none".
  * **numOfTopBottoms** - an integer value that indicates the number of dots should be highlighted when the **radius** channel is specified and the **highlightScope** is *"top"*, *"bottom"* or *"topBottom"*. Default is 5.
  * **dotRadius** - sets the radius of dot. Default is 5;
  * **bubbleRadiusRange** - sets the range of dot radius when the **radius** channel is specified. Default is [5, 30].
  * **showTooltip** - specifies whether the tooptip is enabled.
  * **showAnnotation** - specifies whether the annotation is enabled.
  * **showTicksOnRules** - specifies whether the ticks is displayed on rules. 
  * **x**, **y**, **radius** - sets scale parameters for x, y and radius axis.
    * **initValue** - specifies the initial value (position) for horizontal (y) or vertical (x) rule.
    * **exponent** - sets the exponent for scalePow.
    * **scaleType** - sets the type of scale to *"linear"*, *"log"*, *"sqrt"* or *"pow"*. Default is "linear".   
~~~js
      new BCGMatrix(data, {
        x: {
          initValue: 1500,
          exponent: 0.5,
          scaleType: "pow"
        }
      });
~~~
  * **columns** - sets column name, label and display format for each axis.
    * **name** 
      * **name** - sets the column name
    * **x**, **y**, **radius**
      * **name** - sets the column name
      * **label** - sets the display label
      * **format** - sets number format
        * **short** - the number format for axis ticks. Default is ",.2s".
        * **long** - the number format for the value displayed in tooltip and annotation. Default is ".,2f".          
~~~js
        new BCGMatrix(data, {
            columns: {
              name: { name: "Subcategory" },
              x: {
                name: "Sales",
                label: "Sales (USD)"
              },
              y: {
                name: "YOY",
                label: "YOY Growth %",
                format: { short: ".0%", long: ".1%" }
              }
            }
          });
~~~
  * **zones** - sets the caption, color and icon of each quadrant.
    * **stars**, **cows**, **questionMarks**, **dogs**
      * **caption** - sets the caption
      * **color** - sets the color
      * **icon** - sets the icon
  * **colors** - overrides the default color settings.
    * **rule** - sets the color of rules. Default is "#aaa".
    * **text** - sets the color of labels. Default is "black".
    * **ticks** - sets the color of ticks. Default is "black".
    * **background** - sets the background color of the chart. Default is "none".
  * **font** - overrides the default font settings.
    * **family** - sets the font family.
    * **size** - sets the font size. Default is 9.
    * **style** - sets the font style. Default is "normal".
    * **weight** - sets the font weight. Default is "normal".
  * **events** - *please refer to the first demo for usage*.
    * **onclick** - occurs when click on a dot. This event has two arguments:
      * **e** - the PointerEvent instance
      * **d** - datum
    * **onhover** - occurs when mouse hovers over a dot. This event has two arguments - e and d.
    * **onleave** - occurs when mouse leaves a dot. This event has two arguments - e and d.
    * **onrulemove** - occurs when a rule is dragging by user. This event has three arguments - id, position and value.
      * **id** -
        * **1** - vertical rule
        * **2** - horizontal rule
      * **position** - the x or y position of the rule
      * **value** - the current value of the rule
    * **onrulechange** - occurs when user has finished drags a rule. This event has three arguments - id, position and value. 
* **render()** - Renders the matrix and returns the matrix SVG if container is not assigned in the constructor.
* **dispose()** - Disposes allocated resources and removes event listeners.
* **getDots(zoneIndex)** - Returns an array of all the dots in the specified zone.
  * **zoneIndex**:
    * **0** - questionMarks
    * **1** - stars
    * **2** - dogs
    * **3** - cows