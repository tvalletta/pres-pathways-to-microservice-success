const _sv_defaultOpts = {
  $el: undefined,
  sends: {
    max: 500
  },
  dequeue: {
    interval: 20,
    count: 5
  }
}

class StackVisualization {
  constructor(opts) {
    Object.assign(this, _sv_defaultOpts, opts)

    this.dataset = []
    this.load = 0

    this.point = 

    this.svg = d3
      .select(this.$el)
      .append('svg')
      .attr('width', 800)
      .attr('height', 600)

    this.svg
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 800)
      .attr('height', 600)

    this.runDequeuer()
    this.runGenerator()
  }

  runDequeuer() {
    const { count, interval } = this.dequeue
    setInterval(function() {
      if (load >= count) load -= count
    }, interval)
  }

  /**
   * Randomly generate new data and transition the object to the
   * new data every second
   */
  runGenerator() {
    const { max: MAX_SENDS } = this.sends
    var points = Math.ceil(Math.random() * MAX_SENDS)
    for (var i = 0; i < points; ++i) {
      this.dataset[i] = {
        x: Math.random() * 400,
        y: Math.random() * 600,
        delay: Math.round(Math.random() * 4600)
      }
    }
    this.redraw()
  }

  getLoad() {
    var y = 600 - this.load
    this.load += 3
    return y
  }

  redraw() {
    var points = this.svg.selectAll('circle').data(this.dataset)
    
    points
      .enter()
      .append('circle')
      .style('opacity', 0)
    points.exit().remove()

    var sends = this.svg.selectAll('line').data(this.dataset)
    sends
      .enter()
      .append('line')
      .style('opacity', 0)
    sends.exit().remove()

    this.init(points, sends)
  }



  init(points, sends) {
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

    this.show(points, sends)
  }

  show(points, sends) {
    const pop = this.pop.bind(this)
    const transmit = this.transmit.bind(this)
    points.each(pop)
    sends.each(transmit)
  }

  pop(d, x, y, z) {
    d3
      .select(this)
      .transition()
      .delay(d.delay)
      .duration(40)
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
      .each('end', this.puff)
  }

  puff(d) {
    d3
      .select(this)
      .transition()
      .duration(160)
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

  transmit(d) {
    const trailOff = this.trailOff.bind(this)
    const queue = this.queue.bind(this)
    d3
      .select(this)
      .transition()
      .delay(d.delay)
      .duration(200)
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
      .style('opacity', 1)
      .each('end', function(d) {
        trailOff(d)
        queue(d)
      })
  }

  trailOff(d) {
    d3
      .select(this)
      .transition()
      .duration(300)
      .attr('x1', 420)
      .attr('y1', function(d) {
        return d.y
      })
      .attr('x2', 420)
      .attr('y2', function(d) {
        return d.y
      })
      .style('opacity', 1)
  }

  queue(d) {
    var load = this.getLoad()
    this.svg
      .append('line')
      .attr('x1', 420)
      .attr('y1', d.y)
      .attr('x2', 500)
      .attr('y2', load)
      .style('opacity', 1)
      .transition()
      .duration((600 - load) * 4)
      .attr('x1', 420)
      .attr('y1', d.y)
      .attr('x2', 500)
      .attr('y2', 600)
      .style('opacity', 1)
      .each('end', fade)
    this.svg
      .append('line')
      .attr('x1', 500)
      .attr('y1', load)
      .attr('x2', 550)
      .attr('y2', load)
      .style('stroke', 'gray')
      .style('opacity', 1)
      .transition()
      .duration((600 - load) * 4)
      .attr('x1', 500)
      .attr('y1', 600)
      .attr('x2', 550)
      .attr('y2', 600)
      .style('opacity', 1)
  }

  fade(d) {
    d3
      .select(this)
      .transition()
      .duration(200)
      .ease('out')
      .style('opacity', 0)
  }
}
