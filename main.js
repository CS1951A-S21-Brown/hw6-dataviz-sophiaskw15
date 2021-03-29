// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 40, right: 80, bottom: 40, left: 300 };


// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
var start = true;

let width = 900, height = 350;




let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;

let svg = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);    // HINT: transform


let x = d3.scaleLinear()
    .range([0, graph_2_width - margin.left - margin.right]);


let y = d3.scaleBand()
    .range([0, graph_2_height - margin.top - margin.bottom])
    .padding(0.1);


let error = d3.select("#g2_error");

function setData(year) {
    if (Number.isNaN(year) || parseInt(year) < 1980 || parseInt(year) > 2020) {
        error.style("opacity", 1);
        return;
    }
    else{
        error.style("opacity", 0);
    }
    svg.selectAll('*').remove();

    d3.csv("../data/video_games.csv").then(function (data) {

        var dict = {}
        for (let i = 0; i < data.length; i++) {
            if (data[i]["Year"] == year) {
                let temp = {}
                temp["Name"] = data[i]["Name"]
                temp["Global_Sales"] = data[i]["Global_Sales"]
                dict[data[i]["Name"]] = temp



            }
        }

        let countRef = svg.append("g");

        let y_axis_label = svg.append("g");


        svg.append("text")
            .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2},
                                                ${(graph_2_height - margin.top - margin.bottom) + 15})`)
            .style("text-anchor", "middle")
            .text("Sales (Millions)");




        let y_axis_text = svg.append("text")
            .attr("transform", `translate(-150, ${(graph_2_height - margin.top - margin.bottom) / 2})`)
            .style("text-anchor", "middle")
            .text("Game");


        let title = svg.append("text")
            .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-10})`)
            .style("text-anchor", "middle")
            .style("font-size", 15);



        const vals = Object.values(dict)


        data = cleanData([].slice.call(vals), function (a, b) { return parseFloat(b.Global_Sales) - parseFloat(a.Global_Sales) }, 10);

        x.domain([0, d3.max(data, function (d) { return parseFloat(d['Global_Sales']); })]);

        y.domain(data.map(function (d) { return d['Name'] }));

        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));




        let bars = svg.selectAll("rect").data(data);

        let color = d3.scaleOrdinal()
            .domain(data.map(function (d) { return d['Name'] }))
            .range(d3.quantize(d3.interpolateHcl("#0e818c", "#7bc2f1"), 10));



        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("fill", function (d) { return color(d['Name']) })
            .transition()
            .duration(1000)
            .attr("x", x(0))
            .attr("y", function (d) { return y(d['Name']) })
            .attr("width", function (d) { return x(parseFloat(d['Global_Sales'])) })
            .attr("height", y.bandwidth());


        let counts = countRef.selectAll("text").data(data);


        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function (d) { return x(parseFloat(d['Global_Sales'])) + 10 })
            .attr("y", function (d) { return y(d['Name']) + 10 })
            .style("text-anchor", "start")
            .text(function (d) { return parseFloat(d['Global_Sales']) });

        title.text(`Top Worldwide Sales for ${year}`);



        bars.exit().remove();
        counts.exit().remove();
    });
}

let graph_3_width = MAX_WIDTH / 3, graph_3_height = 575;
const radius = Math.min(graph_3_width, graph_3_height) / 3



var svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${graph_3_width / 2}, ${graph_3_height / 2})`);

let tooltip = d3.select("#graph3")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


function setDataGenre(region) {
    d3.csv("../data/video_games.csv").then(function (data) {
        let output = {}
        let total_sales = 0
        let genre = data.map(function (d) {
            return d['Genre']
        })
        let region_sales = data.map(function (d) {
            return d[region]
        })

        for (let i = 0; i < genre.length; i++) {
            total_sales += parseFloat(region_sales[i]);
            if (output.hasOwnProperty(genre[i])) {
                output[genre[i]] += parseFloat(region_sales[i])
            } else {
                output[genre[i]] = parseFloat(region_sales[i])
            }
        }
        let most = 0;
        let top_genre = null;
        for (const genre in output) {
            let txt = document.getElementById(genre + "_label").innerHTML
            let num = Math.round(output[genre] * 100) / 100
            if (num > most){
                most = num
                top_genre = genre
            }
            document.getElementById(genre + "_label").innerHTML = `${txt.split(":")[0]}:\t${num}`
            if (document.getElementById(genre + "_label").style['text-decoration'] = "underline") {
                document.getElementById(genre + "_label").style['text-decoration'] = "";
            }

        }
        document.getElementById(top_genre+"_label").style["text-decoration"] = "underline";


            let color = d3.scaleOrdinal()
            .domain(output)
            .range(["#171a5b", "#605cbf", "#243921", "#70967e", "#990000", "#ff6666", "#66b3ff", "#00cccc", "#8cd98c", "#6b486b", "#db70b8", "#006666"])


        let pie = d3.pie()
            .value(function (d) { return d.value; })
        let data3 = pie(d3.entries(output))

        let arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);



        let mouseover = function (d) {
            console.log("moused-over");
            let color_span = `<span style="color: ${color(d.data.key)};">`;
            let html = `${d.data.key}: 
            ${color_span}${parseInt(d.data.value / total_sales * 100, 10)}%</span>`;

            tooltip.html(html)
                .style("left", `${(d3.event.pageX) - 220}px`)
                .style("top", `${(d3.event.pageY) - 500}px`)
                .style("box-shadow", `2px 2px 5px ${color(d.data.key)}`)
                .transition()
                .duration(200)
                .style("opacity", 1)
        };


        let mouseout = function (d) {
            console.log("moused-out");
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        };
        let arcs = svg3
            .selectAll('arc')
            .data(data3);
        arcs.enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d) { return (color(d.data.key)) })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        let title2 = svg3.append("text")
            .attr("transform", `translate(${(graph_3_width - margin.left - margin.right - 600) / 10}, ${-200})`)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", 15);

        let region_to_string = {
            "EU_Sales": "Europe",
            "NA_Sales": "North America",
            "JP_Sales": "Japan",
            "Other_Sales": "Other Regions"
        }


        title2.text(`Genre Sales in ${region_to_string[region]}`);

    })
};




let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;

let svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width + margin.left + margin.right)
    .attr("height", graph_1_height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);




function setDataPublisher(genre) {
    if (!start) {
        document.getElementById("dropdown_button").classList.toggle("show");
    }
    d3.csv("../data/video_games.csv").then(function (data) {


        var dict = {}
        for (let i = 0; i < data.length; i++) {
            if (data[i]["Genre"] == genre) {
                let temp = {}
                if (dict.hasOwnProperty(data[i]["Publisher"])) {
                    temp["Global_Sales"] = temp["Global_Sales"] + data[i]["Global_Sales"]
                } else {
                    temp["Publisher"] = data[i]["Publisher"]
                    temp["Global_Sales"] = data[i]["Global_Sales"]
                    dict[data[i]["Publisher"]] = temp
                }
            }



        }
        console.log(dict)
        const vals3 = Object.values(dict)
        console.log(vals3)


        data = cleanData([].slice.call(vals3), function (a, b) {
            return parseInt(b.Global_Sales) - parseInt(a.Global_Sales)
        }, 10);
        let title1 = svg1.append("text")
            .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-10})`)
            .style("text-anchor", "middle")
            .style("font-size", 15);

        let countRef1 = svg1.append("g");

        let y_axis_label1 = svg.append("g");

        let x_axis_text = svg1.append("text")
            .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2},
                                        ${(graph_1_height - margin.top - margin.bottom) + 100})`)
            .style("text-anchor", "middle")
            .text("Sales (Millions)");




        let y_axis_text1 = svg1.append("text")
            .attr("transform", `translate(-150, ${(graph_1_height - margin.top - margin.bottom) / 2})`)
            .style("text-anchor", "middle")
            .text("Publisher");

        let x_axis = d3.scaleLinear()
            .domain([0, 150])
            .range([0, width]);
        svg1.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x_axis))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        var y_axis = d3.scaleBand()
            .range([0, graph_1_height])
            .domain(data.map(function (d) { return d.Publisher; }))
            .padding(1);
        svg1.append("g")
            .call(d3.axisLeft(y_axis));

        y_axis_label1.call(d3.axisLeft(y).tickSize(0).tickPadding(10));



        let lines = svg1.selectAll("lines")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", function (d) { return x_axis(d.Global_Sales); })
            .attr("x2", x_axis(0))
            .attr("y1", function (d) { return y_axis(d.Publisher); })
            .attr("y2", function (d) { return y_axis(d.Publisher); })
            .attr("stroke", "grey");


        let dots = svg1.selectAll("dots")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x_axis(d.Global_Sales); })
            .attr("cy", function (d) { return y_axis(d.Publisher); })
            .attr("r", "7")
            .style("fill", "#74b9f6")
            .attr("stroke", "black")

        let counts1 = countRef1.selectAll("text").data(data);


        counts1.enter()
            .append("text")
            .merge(counts1)
            .transition()
            .duration(1000)
            .attr("x", function (d) { return x_axis(parseFloat(d['Global_Sales'])) + 10 })
            .attr("y", function (d) { return y_axis(d['Publisher']) + 10 })
            .style("text-anchor", "start")
            .text(function (d) { return parseFloat(d['Global_Sales']) });

        title1.text(`Sales by Publisher in ${genre}`);




    });
}
var svg5 = d3.select("#legend")
svg5.append("text").attr("x", 0).attr("y", 15).text("Sales by Genre (Millions)").style("font-size", "15px").style("font-weight", "bold")
svg5.append("circle").attr("cx", 10).attr("cy", 35).attr("r", 10).style("fill", "#2b2e79")
svg5.append("circle").attr("cx", 10).attr("cy", 65).attr("r", 10).style("fill", "#605cbf")
svg5.append("text").attr("x", 30).attr("y", 40).text("Sports").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Sports_label")
svg5.append("text").attr("x", 30).attr("y", 70).text("Platform").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Platform_label")
svg5.append("circle").attr("cx", 10).attr("cy", 95).attr("r", 10).style("fill", "#4c6648")
svg5.append("circle").attr("cx", 10).attr("cy", 125).attr("r", 10).style("fill", "#83a28f")
svg5.append("text").attr("x", 30).attr("y", 100).text("Racing").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Racing_label")
svg5.append("text").attr("x", 30).attr("y", 130).text("Role-Playing").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Role-Playing_label")
svg5.append("circle").attr("cx", 10).attr("cy", 155).attr("r", 10).style("fill", "#990000")
svg5.append("circle").attr("cx", 10).attr("cy", 185).attr("r", 10).style("fill", "#ff6666")
svg5.append("text").attr("x", 30).attr("y", 160).text("Puzzle").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Puzzle_label")
svg5.append("text").attr("x", 30).attr("y", 190).text("Miscellaneous").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Misc_label")
svg5.append("circle").attr("cx", 10).attr("cy", 215).attr("r", 10).style("fill", "#66b3ff")
svg5.append("circle").attr("cx", 10).attr("cy", 245).attr("r", 10).style("fill", "#00cccc")
svg5.append("text").attr("x", 30).attr("y", 220).text("Shooter").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Shooter_label")
svg5.append("text").attr("x", 30).attr("y", 250).text("Simulation").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Simulation_label")
svg5.append("circle").attr("cx", 10).attr("cy", 275).attr("r", 10).style("fill", "#8cd98c")
svg5.append("circle").attr("cx", 10).attr("cy", 305).attr("r", 10).style("fill", "#6b486b")
svg5.append("text").attr("x", 30).attr("y", 280).text("Action").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Action_label")
svg5.append("text").attr("x", 30).attr("y", 310).text("Fighting").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Fighting_label")
svg5.append("circle").attr("cx", 10).attr("cy", 335).attr("r", 10).style("fill", "#db70b8")
svg5.append("circle").attr("cx", 10).attr("cy", 365).attr("r", 10).style("fill", "#037e7e")
svg5.append("text").attr("x", 30).attr("y", 340).text("Adventure").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Adventure_label")
svg5.append("text").attr("x", 30).attr("y", 370).text("Strategy").style("font-size", "15px").attr("alignment-baseline", "left").attr("id", "Strategy_label")

function cleanData(data, comparator, numExamples) {
    return (data.sort(comparator).slice(0, numExamples));

}

setData(2010);

setDataPublisher('Misc');

setDataGenre('EU_Sales');

start = false;


