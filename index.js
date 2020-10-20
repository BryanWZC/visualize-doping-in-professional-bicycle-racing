const width = 1000;
const height = 500;

//svg element
const svg = d3.select('.scatterplot')
    .attr('width', width)
    .attr('height', height);

// title
const title = svg.append('text')
    .attr('id', 'title')
    .attr('text-anchor', 'middle')
    .attr('fill', '#394F49')
    .attr('x', '50%')
    .attr('y', 0)
    .attr('font-size', 24)
    .text('Doping in Professional Bicycle Racing');

// subtitle
const subtitle = svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', '#394F49')
    .attr('x', '50%')
    .attr('y', '1.5em')
    .text("35 Fastest times on Alpe d'Huez");

// yAxis
const yDomain = [convertToMil('39:50'), convertToMil('36:50')];
const yAxisScale = d3.scaleLinear()
    .domain(yDomain)
    .range([height, 0]);

const timeArr = [];

for(let i = 37; i <= 39.45; i+=.15){
    let str;
    if(i % 1 > 0.59){
        i = Math.floor(i) + 1;
        str = String(i) + '.00'
    }
    else str = String(i.toFixed(2));
    timeArr.push(convertToMil(str.padEnd(5,0)));
}

const yAxis = d3.axisLeft(yAxisScale)
    .tickValues(timeArr).tickFormat(d => {
        const time = new Date(d);
        const min = time.getUTCMinutes();
        const sec = time.getUTCSeconds();
        return `${min}:${String(sec).padEnd(2,0)}`
    });

svg.append('g')
    .attr('id', 'y-axis')
    .call(yAxis);

// xAxis
const xDomain = [1992, 2016];

const xAxisScale = d3.scaleLinear()
    .domain(xDomain)
    .range([0, width]);

const yearArr = [];

for(let i = 1994; i <= 2016; i+=2){
    yearArr.push(i);
}

const xAxis = d3.axisBottom(xAxisScale)
    .tickValues(yearArr).tickFormat(d => String(d));

svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .attr('id', 'x-axis')
    .call(xAxis)


// data
async function getData(){
    const json = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json');
    const obj = json.json();
    return obj;
}

// dots
const xScale = xAxisScale;
const yScale = yAxisScale;

async function dots(){
    const data = await getData();

    svg.selectAll('circle')
        .data(data, d => d).enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('fill',d => d.Doping ? '#F87575' : '#43AA8B')
        .attr('data-xvalue', d => d.Year)
        .attr('data-yvalue', d => {
            const time = d.Time.split(/[\:]/);
            const date = new Date(Date.UTC(1970, 0, 1, 0, time[0], time[1]));
            return date;
        })
        .attr('cx', d => xScale(d.Year))
        .attr('cy', d => yScale(convertToMil(d.Time)))
        .attr('stroke', '#394F49')
        .attr('stroke-width', 0.5)
        .attr('stroke-opacity', 0.6)
        .attr('r', 7)
        .on('mouseover', (e,d) => {
            const textWidth = 7 * d.Doping.length || 185;
            const tooltip = svg.append('g')
                .attr('id', 'tooltip')
                .attr('data-year', d.Year)
                .attr('data-xvalue', xScale(d.Year))
                .attr('width', textWidth)
                .attr('height', '75')
                .attr('transform', `translate(${xScale(d.Year) - textWidth/2}, ${yScale(convertToMil(d.Time)) - 95})`);

            const tooltipBox = tooltip.append('rect')
                .attr('width', textWidth)
                .attr('height', '75')
                .attr('fill', '#DBD053')
                .attr('opacity', 0.8);
            
            tooltip.append('text')
                .attr('font-size', 8)
                .attr('text-anchor', 'start')
                .attr('y', 25)
                .attr('x', 25)
                .text(`${d.Name} - ${d.Nationality}`);
            
            tooltip.append('text')
                .attr('font-size', 8)
                .attr('text-anchor', 'start')
                .attr('y', 40)
                .attr('x', 25)
                .text(`Year: ${d.Year}, Time: ${d.Time}`);

            const doping = tooltip.append('text')
                .attr('font-size', 8)
                .attr('text-anchor', 'start')
                .attr('y', 55)
                .attr('x', 25)
                .text(`${d.Doping}`);
        })
        .on('mouseout', (e,d) => {
            svg.selectAll('#tooltip').remove();
        })
        .on('click', (e,d) => {
            window.location.href = d.URL;
        })

}

dots();


// legend
const legendWrapper = svg.append('g')
    .attr('id', 'legend')
    .attr('width', 170)
    .attr('height', 100)
    .attr('transform', `translate(${width - 170},${height / 2})`);

const legend = legendWrapper.append('rect')
    .attr('width', 170)
    .attr('height', 100)
    .attr('opacity', 0);

const noDopping = legendWrapper.append('text')
    .attr('text-anchor', 'end')
    .attr('fill', '#394F49')
    .attr('font-size', 16)
    .attr('x', 150)
    .attr('y', 25)
    .text('No dopping allegations') ;

const noDoppingBox = legendWrapper.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', '#43AA8B')
    .attr('x', 160)
    .attr('y', 16)

const dopping = legendWrapper.append('text')
    .attr('text-anchor', 'end')
    .attr('fill', '#394F49')
    .attr('font-size', 16)
    .attr('x', 150)
    .attr('y', 50)
    .text('Dopping allegations') ;

const doppingBox = legendWrapper.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', '#F87575')
    .attr('x', 160)
    .attr('y', 41)

// Utility functions
function timeStrToNum(str){
    const time = str.split(/[\.\:]/);
    const min = Number(time[0]);
    const sec = Number((time[1] / 60).toFixed(2));
    return min + sec;
}

function convertToMil(str){
    const time = str.split(/[\:\.]/);
    const date = new Date(Date.UTC(1970, 0, 1, 0, time[0], time[1]));
    return Date.parse(date);
}