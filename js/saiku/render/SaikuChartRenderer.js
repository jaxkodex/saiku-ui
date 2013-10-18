
var SaikuChartRenderer = function(data, options) {
    this.rawdata = data;
    this.cccOptions = {};
    this.type = 'stackedBar';

    this.data = null,
    this.hasProcessed = false;

    if (!options && !options.hasOwnProperty('htmlObject')) {
        throw("You need to supply a html object in the options for the SaikuChartRenderer!");
    }
    this.el = $(options.htmlObject);
    this.id = _.uniqueId("chart_");
    $('<div class="canvas_wrapper" style="display:none;"><div id="canvas_' + this.id + '"></div></div>').appendTo($(this.el));

    this.cccOptions.canvas = 'canvas_' + this.id;
    this.cccOptions = this.getQuickOptions(this.cccOptions);
    this.data = null;

    if (options.mode && options.mode in this) {
        this[options.mode]();
    }

    if (this.type == "sunburst") {

    } else {
        this.process_data_tree( { data : this.rawdata }, true, true);
        this.define_chart();
    }

};

SaikuChartRenderer.prototype.zoomin = function() {
        var chart = this.chart.root;
        var data = chart.data;         
        data
        .datums(null, {selected: false})
        .each(function(datum) {
            datum.setVisible(false);
        });
        data.clearSelected();         
        chart.render(true, true, false);
    },

SaikuChartRenderer.prototype.zoomout = function() {
        var chart = this.chart.root;
        var data = chart.data;
        var kData = chart.keptVisibleDatumSet;

        if (kData == null || kData.length == 0) {
            $(this.el).find('.zoomout').hide();
        }
        else if (kData.length == 1) {
            $(this.el).find('.zoomout').hide();
            chart.keptVisibleDatumSet = [];
            pvc.data.Data.setVisible(data.datums(null, { visible : false}), true);

        } else if (kData.length > 1) {
            chart.keptVisibleDatumSet.splice(kData.length - 1, 1);
            var nonVisible = data.datums(null, { visible : false}).array();
            var back = chart.keptVisibleDatumSet[kData.length - 1];
            _.intersection(back, nonVisible).forEach(function(datum) {
                    datum.setVisible(true);
            });
        }
        chart.render(true, true, false);
};

SaikuChartRenderer.prototype.render = function() {
    console.log(this.chart.options.type + " on " + this.chart.options.canvas);
    _.delay(this.render_chart_element, 0, this);
};
    

SaikuChartRenderer.prototype.stackedBar = function() {
    this.type = 'stackedBar';
    var options = {
        stacked: true,
        type: "BarChart"
    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};
    
SaikuChartRenderer.prototype.bar = function() {
    this.type = 'bar';
    var options = {
        type: "BarChart"
    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};

SaikuChartRenderer.prototype.multiplebar = function() {
    this.type = "multiplebar";
    var options = {
        type: "BarChart",
        multiChartIndexes: [1],
        dataMeasuresInColumns: true,
        orientation: "vertical",
        smallTitlePosition: "top",
        multiChartMax: 30,
        multiChartColumnsMax: Math.floor( this.cccOptions.width / 200),
        smallWidth: 200,
        smallHeight: 150

    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};
    
SaikuChartRenderer.prototype.line = function() {
    this.type = "line";
    var options = {
        type: "LineChart"
    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};
    
SaikuChartRenderer.prototype.pie = function() {
    this.type = "pie";
    var options = {
        type: "PieChart",
        multiChartIndexes: [0] // ideally this would be chosen by the user (count, which)
    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};

SaikuChartRenderer.prototype.heatgrid = function() {
    this.type = "heatgrid";
    var options = {
        type: "HeatGridChart"
    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};

SaikuChartRenderer.prototype.stackedBar100 = function() {
    this.type = "stackedBar100";
    var options = {
        type: "NormalizedBarChart"
    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};

SaikuChartRenderer.prototype.area = function() {
    this.type = "area";
    var options = {
        type: "StackedAreaChart"
    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};

SaikuChartRenderer.prototype.dot = function() {
    this.type = "dot";
    var options = {
        type: "DotChart"
    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};

SaikuChartRenderer.prototype.waterfall = function() {
    this.type = "waterfall";
    var options = {
        type: "WaterfallChart"
    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};

SaikuChartRenderer.prototype.sunburst = function() {
    this.type = "sunburst";

    var data = this.process_data_tree({ data: this.rawdata });
    var options = this.getQuickOptions({});

    function title(d) {
      return d.parentNode ? (title(d.parentNode) + "." + d.nodeName) : d.nodeName;
    }

    var re = "",
        nodes = pv.dom(data).nodes(); // .root("flare").nodes();

    var tipOptions = {
          delayIn: 200,
          delayOut:80,
          offset:  2,
          html:    true,
          gravity: "nw",
          fade:    false,
          followMouse: true,
          corners: true,
          arrow:   false,
          opacity: 1
    };

    var color = pv.colors(options.colors).by(function(d) { return d.parentNode && d.parentNode.nodeName; });

    var vis = new pv.Panel()
        .width(options.width)
        .height(options.height)
        .canvas(options.canvas);

    var partition = vis.add(pv.Layout.Partition.Fill)
        .nodes(nodes)
        .size(function(d) { return d.nodeValue; })
        .order("descending")
        .orient("radial");

    partition.node.add(pv.Wedge)
        .fillStyle( pv.colors(options.colors).by(function(d) { return d.parentNode && d.parentNode.nodeName }))
        .strokeStyle("#fff")
        .lineWidth(0.5)
        .text(function(d) {  
            var v = "";
            if (typeof d.nodeValue != "undefined") {
                v = " : " + d.nodeValue;
            }
            return (d.nodeName + v); 
        } )
                .cursor('pointer')
                .events("all")
                .event('mousemove', pv.Behavior.tipsy(tipOptions) );

    partition.label.add(pv.Label)
        .visible(function(d) { return d.angle * d.outerRadius >= 6; });

    
        this.chart = vis;
};

SaikuChartRenderer.prototype.treemap = function() {
    this.type = "treemap";
    var options = {
        type: "TreemapChart"
    };
    this.cccOptions = this.getQuickOptions(options);
    this.define_chart();
};


// Default static style-sheet
SaikuChartRenderer.prototype.cccOptionsDefault = {
        Base: {
            animate: false,
            selectable: true,
            valuesVisible: false,
            legend:  true,
            legendPosition: "top",
            legendAlign: "right",
            legendSizeMax: "30%",
            axisSizeMax: "40%",
            plotFrameVisible : false,
            orthoAxisMinorTicks : false,
            colors: ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5" ]
        },
        
        HeatGridChart: {
            orientation: "horizontal",
            useShapes: true,
            shape: "circle",
            nullShape: "cross",
            colorNormByCategory: false,
            sizeRole: "value",
            legendPosition: "right",
            legend: true,
            hoverable: true,
            axisComposite: true,
            colors: ["red", "yellow", "lightgreen", "darkgreen"],
//            xAxisSize: 130,
            yAxisSize: "30%"
        },
        
        WaterfallChart: {
            orientation: "horizontal"
        },
        
        PieChart: {
            multiChartColumnsMax: 3,
            multiChartMax: 30,
            smallTitleFont: "bold 14px sans-serif",
            valuesVisible: true,
            valuesMask: "{value.percent}",
            explodedSliceRadius: "10%",
            extensionPoints: {
                slice_innerRadiusEx: '40%',
                 slice_offsetRadius: function(scene) {
                       return scene.isSelected() ? '10%' : 0;
                }
            },
            clickable: true
            //valuesLabelStyle: 'inside'
        },
        
        LineChart: {
            extensionPoints: {
                area_interpolate: "monotone", // cardinal
                line_interpolate: "monotone"
            }
        },
        
        StackedAreaChart: {
            extensionPoints: {
                area_interpolate: "monotone",
                line_interpolate: "monotone"
            }
        },
        TreemapChart: {
            legendPosition: "right",
             multiChartIndexes: 0,
            extensionPoints: {
                leaf_lineWidth : 2
            },
            layoutMode: "slice-and-dice",
            valuesVisible: true
        }
};
    
SaikuChartRenderer.prototype.getQuickOptions = function(baseOptions) {
        var chartType = (baseOptions && baseOptions.type) || "BarChart";
        var workspaceResults = $(this.el);
        var options = _.extend({
                type:   chartType,
                canvas: 'canvas_' + this.id,
                width:  workspaceResults.width() - 40,
                height: workspaceResults.height() - 40
            },
            this.cccOptionsDefault.Base,
            this.cccOptionsDefault[chartType], // may be undefined
            baseOptions);
        
        if(this.data != null && this.data.resultset.length > 5) {
            if(options.type === "HeatGridChart") {
                options.xAxisSize = 150;
            } else if(options.orientation !== "horizontal") {
                options.extensionPoints = _.extend(Object.create(options.extensionPoints || {}),
                    {
                        xAxisLabel_textAngle: -Math.PI/2,
                        xAxisLabel_textAlign: "right",
                        xAxisLabel_textBaseline:  "middle"
                    });
            }
        }
        
        return options;
};

    
SaikuChartRenderer.prototype.define_chart = function(displayOptions) {
        if (!this.hasProcessed) {
            this.process_data_tree( { data : this.rawdata }, true, true);
        }
        var self = this;
        var workspaceResults = $(this.el);
        var isSmall = (this.data != null && this.data.height < 80 && this.data.width < 80);
        var isMedium = (this.data != null && this.data.height < 300 && this.data.width < 300);
        var isBig = (!isSmall && !isMedium);
        var animate = false;
        var hoverable =  isSmall;

        var runtimeWidth = (workspaceResults.width() - 20);
        var runtimeHeight = workspaceResults.height() - 20;

        var runtimeChartDefinition = _.clone(this.cccOptions);

        if (displayOptions && displayOptions.width) {
            runtimeWidth = displayOptions.width;
        }
        if (displayOptions && displayOptions.height) {
            runtimeHeight = displayOptions.height;
        }

        if (runtimeWidth > 0) {
            runtimeChartDefinition.width = runtimeWidth;
        }
        if (runtimeHeight > 0) {
            runtimeChartDefinition.height = runtimeHeight;
        }

         if (isBig) {
            if (runtimeChartDefinition.hasOwnProperty('extensionPoints') && runtimeChartDefinition.extensionPoints.hasOwnProperty('line_interpolate'))
                delete runtimeChartDefinition.extensionPoints.line_interpolate;
            if (runtimeChartDefinition.hasOwnProperty('extensionPoints') && runtimeChartDefinition.extensionPoints.hasOwnProperty('area_interpolate'))
                delete runtimeChartDefinition.extensionPoints.area_interpolate;
         }
         runtimeChartDefinition = _.extend(runtimeChartDefinition, {
                hoverable: hoverable,
                animate: animate,
                legend: {
                    scenes: {
                        item: {
                            execute: function() {

                                var chart = this.chart();

                                if (!chart.hasOwnProperty('keptVisibleDatumSet')) {
                                    chart.keptVisibleDatumSet = [];
                                }

                                var keptSet = chart.keptVisibleDatumSet.length > 0
                                                            ? chart.keptVisibleDatumSet[chart.keptVisibleDatumSet.length - 1] 
                                                            : [];
                                var zoomedIn = keptSet.length > 0;

                                if (zoomedIn) {
                                    _.intersection(this.datums().array(), keptSet).forEach(function(datum) {
                                        datum.toggleVisible();
                                    });

                                } else {
                                    pvc.data.Data.toggleVisible(this.datums());
                                }
                                this.chart().render(true, true, false);

                            }
                        }
                    }
                },
                userSelectionAction: function(selectingDatums) {
                    if (selectingDatums.length == 0) {
                        return [];
                    }

                    var chart = self.chart.root;
                    var data = chart.data;
                    var selfChart = this.chart;

                    if (!selfChart.hasOwnProperty('keptVisibleDatumSet')) {
                        selfChart.keptVisibleDatumSet = [];
                    }

                    // we have too many datums to process setVisible = false initially
                    if (data.datums().count() > 1500) {
                        pvc.data.Data.setSelected(selectingDatums, true);
                    } else if (data.datums(null, {visible: true}).count() == data.datums().count()) {
                        $(self.el).find('.zoomout').show();

                        var all = data.datums().array();

                        _.each( _.difference(all, selectingDatums), function(datum) {
                            datum.setVisible(false);
                        });

                        selfChart.keptVisibleDatumSet = [];
                        selfChart.keptVisibleDatumSet.push(selectingDatums);

                    } else {
                        var kept = selfChart.keptVisibleDatumSet.length > 0 
                            ? selfChart.keptVisibleDatumSet[selfChart.keptVisibleDatumSet.length - 1] : [];

                        
                        var visibleOnes = data.datums(null, { visible: true }).array();

                        var baseSet = kept;
                        if (visibleOnes.length < kept.length) {
                            baseSet = visibleOnes;
                            selfChart.keptVisibleDatumSet.push(visibleOnes);
                        }

                        var newSelection = [];
                        _.each( _.difference(visibleOnes, selectingDatums), function(datum) {
                            datum.setVisible(false);
                        });
                        _.each( _.intersection(visibleOnes, selectingDatums), function(datum) {
                            newSelection.push(datum);
                        });

                        if (newSelection.length > 0) {
                            selfChart.keptVisibleDatumSet.push(newSelection);
                        }
                    }
                    
                
                chart.render(true, true, false);
                return [];

                }
        });

        this.chart = new pvc[runtimeChartDefinition.type](runtimeChartDefinition);
        this.chart.setData(this.data, {
            crosstabMode: true,
            seriesInRows: false
        });
};

SaikuChartRenderer.prototype.render_chart_element = function(context) {
        var self = context || this;

        var isSmall = (self.data != null && self.data.height < 80 && self.data.width < 80);
        var isMedium = (self.data != null && self.data.height < 300 && self.data.width < 300);
        var isBig = (!isSmall && !isMedium);
        var animate = false;
        if (self.chart.options && self.chart.options.animate) {
            animate = true;
        }

        try {
            if (animate) {
                $(self.el).find('.canvas_wrapper').show();
            }

            self.chart.render();
            console.log("i rendered " + self.chart.options.type);
        } catch (e) {
            $(self.el).find('.canvas_wrapper').text("Could not render chart" + e);
        }
        if (self.chart.options && self.chart.options.animate) {
            return false;
        }
        if (isIE || isBig) {
            $(self.el).find('.canvas_wrapper').show();
        } else {
            $(self.el).find('.canvas_wrapper').fadeIn(400);
        }
        return false;
};
            
    
SaikuChartRenderer.prototype.process_data_tree = function(args, flat, setdata) {
    var self = this;
        var data = {};
        if (flat) {
            data.resultset = [];
            data.metadata = [];
            data.height = 0;
            data.width = 0;
        }

        var currentDataPos = data;
        if (typeof args == "undefined" || typeof args.data == "undefined") {
            return;
        }

        if (args.data != null && args.data.error != null) {
            return;
        }        
        // Check to see if there is data
        if (args.data == null || (args.data.cellset && args.data.cellset.length === 0)) {
            return;
        }

        var cellset = args.data.cellset;
        if (cellset && cellset.length > 0) {
            var lowest_level = 0;
            var data_start = 0;
            var hasStart = false;
            for (var row = 0; data_start == 0 && row < cellset.length; row++) {
                    for (var field = 0; field < cellset[row].length; field++) {
                        if (!hasStart) {
                            while (cellset[row][field].type == "COLUMN_HEADER" && cellset[row][field].value == "null") {
                                row++;
                            }
                        }
                        hasStart = true;
                        if (cellset[row][field].type == "ROW_HEADER_HEADER") {
                            while(cellset[row][field].type == "ROW_HEADER_HEADER") {
                                if (flat) {
                                    data.metadata.push({
                                        colIndex: field,
                                        colType: "String",
                                        colName: cellset[row][field].value
                                    });
                                }
                                field++;
                            }
                            lowest_level = field - 1;
                        }
                        if (cellset[row][field].type == "COLUMN_HEADER") {
                            var lowest_col_header = 0;
                            var colheader = [];
                            while(lowest_col_header <= row) {
                                if (cellset[lowest_col_header][field].value !== "null") {
                                    colheader.push(cellset[lowest_col_header][field].value);
                                }
                                lowest_col_header++;
                            }
                            if (flat) {
                                data.metadata.push({
                                    colIndex: field,
                                    colType: "Numeric",
                                    colName: colheader.join(' ~ ')
                                });
                            }
                            data_start = row+1;
                        }
                    }
            }
            var labelsSet = {};
            var rowlabels = [];
            for (var labelCol = 0; labelCol <= lowest_level; labelCol++) {
                rowlabels.push(null);
            }
            for (var row = data_start; row < cellset.length; row++) {
            if (cellset[row][0].value !== "") {
                    var record = [];
                    var flatrecord = [];
                    var parent = null;
                    var rv = null;                        
                    
                    for (var labelCol = 0; labelCol <= lowest_level; labelCol++) {
                        if (cellset[row] && cellset[row][labelCol].value === 'null') {
                            currentDataPos = data;
                            var prevLabel = 0;
                            for (; prevLabel < lowest_level && cellset[row][prevLabel].value === 'null'; prevLabel++) {
                                currentDataPos = currentDataPos[ rowlabels[prevLabel] ];
                            }
                            if (prevLabel > labelCol) {
                                labelCol = prevLabel;
                            }

                        }
                        if (cellset[row] && cellset[row][labelCol].value !== 'null') {
                            if (labelCol == 0) {
                                for (var xx = 0; xx <= lowest_level; xx++) {
                                    rowlabels[xx] = null;
                                }
                            }
                            if (typeof currentDataPos == "number") {
                                parent[rv] = {};
                                currentDataPos = parent[rv];
                            }
                            rv = cellset[row][labelCol].value;
                            rowlabels[labelCol] = rv;

                            if (!currentDataPos.hasOwnProperty(rv)) {
                                currentDataPos[rv] = {};
                            }
                            parent = currentDataPos;
                            currentDataPos = currentDataPos[rv];
                        }
                    }
                    flatrecord = _.clone(rowlabels);
                    for (var col = lowest_level + 1; col < cellset[row].length; col++) {
                        var cell = cellset[row][col];
                        var value = cell.value || 0;
                        // check if the resultset contains the raw value, if not try to parse the given value
                        var raw = cell.properties.raw;
                        if (raw && raw !== "null") {
                            value = parseFloat(raw);
                        } else if (typeof(cell.value) !== "number" && parseFloat(cell.value.replace(/[^a-zA-Z 0-9.]+/g,''))) {
                            value = parseFloat(cell.value.replace(/[^a-zA-Z 0-9.]+/g,''));
                        }
                        record.push(value);
                        flatrecord.push(value);
                    }
                    if (flat) data.resultset.push(flatrecord);
                    var sum = _.reduce(record, function(memo, num){ return memo + num; }, 0);
                    parent[rv] = sum;
                    currentDataPos = data;
                }
            }
            //console.log(data);
            if (setdata) {
                self.data = data;
                self.hasProcessed = true;
                self.data.height = self.data.resultset.length;
                self.cccOptions = self.getQuickOptions(self.cccOptions);
                self.define_chart();
            }
            return data;
        } else {
            $(self.el).find('.canvas_wrapper').text("No results").show();
        }
};