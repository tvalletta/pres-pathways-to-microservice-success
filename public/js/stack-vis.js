const _sv_defaultOpts = {
  $el: undefined,
  dataset: undefined,
  dequeue: {
    interval: 16,
    count: 1
  },
  lineToQueue: {
    x1: 580
  },
  queue: {
    x1: 640,
    x2: 780,
    y: 580
  },
  sends: {
    max: 500
  },
  slow: 5
}

function runStackVisualization(_opts) {
  const opts = Object.assign({}, _sv_defaultOpts, _opts)
  var dataset = opts.dataset
  var load = 0

  const { count, interval } = opts.dequeue
  setInterval(function() {
    if (load >= count) load -= count
  }, interval * opts.slow)

  var svg = d3
    .select(opts.$el)
    .append('svg')
    .classed('vis', true)
    .attr('width', 800)
    .attr('height', 600)

  svg
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 800)
    .attr('height', 600)

  function redraw() {
    var points = svg.selectAll('circle').data(dataset)
    points
      .enter()
      .append('circle')
      .style('opacity', 0)
    points.exit().remove()

    var sends = svg.selectAll('line').data(dataset)
    sends
      .enter()
      .append('line')
      .style('opacity', 0)
    sends.exit().remove()

    init(points, sends)
  }

  function init(points, sends) {
    points
      .attr('r', 4)
      .attr('cx', function(d) {
        return d.x
      })
      .attr('cy', function(d) {
        return d.y
      })
      .style('opacity', 0)

    sends
      .attr('x1', function(d) {
        return d.x
      })
      .attr('y1', function(d) {
        return d.y
      })
      .attr('x2', function(d) {
        return d.x + 5
      })
      .attr('y2', function(d) {
        return d.y
      })
      .style('opacity', 0)

    show(points, sends)
  }

  function show(points, sends) {
    points.each(pop)
    sends.each(transmit)
  }

  function pop(d) {
    d3
      .select(this)
      .transition()
      .delay(d.delay * opts.slow)
      .duration(40 * opts.slow)
      .ease('in')
      .attr('r', 8)
      .attr('cx', function(d) {
        return d.x
      })
      .attr('cy', function(d) {
        return d.y
      })
      .style('opacity', 1)
      .style('fill', 'gray')
      .each('end', puff)
  }

  function puff(d) {
    d3
      .select(this)
      .transition()
      .duration(160 * opts.slow)
      .ease('out')
      .attr('r', 24)
      .attr('cx', function(d) {
        return d.x
      })
      .attr('cy', function(d) {
        return d.y
      })
      .style('opacity', 0)
  }

  function transmit(d) {
    d3
      .select(this)
      .transition()
      .delay(d.delay * opts.slow)
      .duration(200 * opts.slow)
      .attr('x1', function(d) {
        return d.x
      })
      .attr('y1', function(d) {
        return d.y
      })
      .attr('x2', 420)
      .attr('y2', function(d) {
        return d.y
      })
      .attr('stroke', 'gray')
      .style('opacity', .25)
      .each('end', function(d) {
        trailOff.call(this)
        queue(d)
      })
  }

  function trailOff(d) {
    d3
      .select(this)
      .transition()
      .duration(300 * opts.slow)
      .attr('x1', 420)
      .attr('y1', function(d) {
        return d.y
      })
      .attr('x2', 420)
      .attr('y2', function(d) {
        return d.y
      })
      .attr('stroke', 'gray')
      .style('opacity', 1)
  }

  function queue(d) {
    var load = getLoad()
    svg
      .append('line')
      .attr('x1', 420)
      .attr('y1', d.y)
      .attr('x2', 500)
      .attr('y2', load)
      .attr('stroke', 'gray')
      .style('opacity', 1)
      .transition()
      .ease('linear')
      .duration(((opts.queue.y - load) * 20) * opts.slow)
      .attr('x1', 500)
      .attr('y1', opts.queue.y)
      .attr('x2', 500)
      .attr('y2', opts.queue.y)
      .style('opacity', 1)
      .each('end', fade)
    svg
      .append('line')
      .attr('x1', 500)
      .attr('y1', load)
      .attr('x2', 750)
      .attr('y2', load)
      .style('stroke', 'gray')
      .style('stroke-width', '3')
      .style('opacity', 1)
      .transition()
      .ease('linear')
      .duration((opts.queue.y - load) * 20 * opts.slow)
      .attr('x1', 500)
      .attr('y1', opts.queue.y)
      .attr('x2', 750)
      .attr('y2', opts.queue.y)
      .style('opacity', 1)
  }

  function fade(d) {
    d3
      .select(this)
      .transition()
      .duration(200 * opts.slow)
      .ease('out')
      .style('opacity', 0)
  }

  // --- Utility Functions ---

  function getLoad() {
    var y = opts.queue.y - load
    load += 3
    return y
  }

  /**
     * Randomly generate new data and transition the object to the
     * new data every second
     */
  function generateRandomDataset() {
    var points = Math.ceil(Math.random() * opts.sends.max)
    for (var i = 0; i < points; ++i) {
      dataset[i] = {
        x: Math.random() * 400,
        y: Math.random() * opts.queue.y,
        delay: Math.round(Math.random() * 4600)
      }
    }
  }
  if (!dataset) {
    generateRandomDataset()
  } 
  redraw()
}
