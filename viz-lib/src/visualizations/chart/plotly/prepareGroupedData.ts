import { uniq, flatten } from "lodash";
import md5 from "md5";

function stringToColour(str: string) {
  let hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
}
function getKeyByValue(object: any, value: any) {
  return Object.keys(object).find(key => object[key] === value);
}

export default function prepareGroupedData(seriesList: any[], options: any) {
  const { columnMapping } = options;
  const groupBy: any = getKeyByValue(columnMapping, "series");
  const splitBy: any = getKeyByValue(columnMapping, "group");
  const x: any = getKeyByValue(columnMapping, "x");
  const y: any = getKeyByValue(columnMapping, "y");

  // console.log(x, y, splitBy, groupBy);

  const categories = uniq(flatten(seriesList.map(series => series.data.map((item: any) => item.x))));
  // console.log(categories);
  const plotlyData = [];
  const legendDisplay: any = {};
  for (let i = 0; i < seriesList.length; i++) {
    for (let j = 0; j < seriesList[i].data.length; j++) {
      const item: any = seriesList[i].data[j].$raw;
      // console.log(item);
      const plotlyItem = {
        x: [item[splitBy]],
        y: [item[y]],
        type: "bar",
        name: item[groupBy],
        legendgroup: item[groupBy],
        xaxis: `x${categories.indexOf(item[x]) + 1}`,
        barmode: "stack",
        xaxisMapping: {
          key: x,
          value: item[x],
        },
        showlegend: !legendDisplay[item[groupBy]],
        marker: { color: stringToColour(md5(item[groupBy])) },
      };

      legendDisplay[item[groupBy]] = true;
      plotlyData.push(plotlyItem);
    }
  }

  return plotlyData;
}
