import Plotly from "plotly.js/lib/core";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'plot... Remove this comment to see the full error message
import bar from "plotly.js/lib/bar";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'plot... Remove this comment to see the full error message
import pie from "plotly.js/lib/pie";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'plot... Remove this comment to see the full error message
import histogram from "plotly.js/lib/histogram";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'plot... Remove this comment to see the full error message
import box from "plotly.js/lib/box";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'plot... Remove this comment to see the full error message
import heatmap from "plotly.js/lib/heatmap";

import prepareData from "./prepareData";
import prepareGroupedData from "./prepareGroupedData";
import prepareLayout from "./prepareLayout";
import prepareGroupedLayout from "./prepareGroupedLayout";
import updateData from "./updateData";
import updateAxes from "./updateAxes";
import updateChartSize from "./updateChartSize";
import { prepareCustomChartData, createCustomChartRenderer } from "./customChartUtils";

// @ts-ignore
Plotly.register([bar, pie, histogram, box, heatmap]);
// @ts-ignore
Plotly.setPlotConfig({
  modeBarButtonsToRemove: ["sendDataToCloud"],
});

export {
  Plotly,
  prepareData,
  prepareGroupedData,
  prepareLayout,
  prepareGroupedLayout,
  updateData,
  updateAxes,
  updateChartSize,
  prepareCustomChartData,
  createCustomChartRenderer,
};
