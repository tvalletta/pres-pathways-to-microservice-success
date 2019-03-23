const _sv_defaultOpts = {
  $el: undefined,
  dataset: {},
  dequeue: {
    interval: 20,
    count: 5
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
  speed: 10
}

function runStackVisualization(_opts) {
  const opts = Object.assign({}, _sv_defaultOpts, _opts)

  let interval
  let dataset = []
  let load = 0
  const workQueue = []
  let workPosition = 0

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

  // --- go ---

  function redraw() {
    const g = svg
      .selectAll('g')
      .data(dataset)
      .enter()
      .append('g')

    workPosition += .1

    let $seg1
    let seg1Tx
    let seg1Tx2
    let $seg2
    let seg2Tx
    let seg2Tx2
    let $seg3
    let seg3Tx
    let seg3Tx2

    g.each(function(d) {
      const $point = point(g, d)
      $point.each(pop)

      $seg1 = segment1(g, d)
      $seg1.each(function(d) {
        seg1Tx = segment1Tx.call(this, d)
        seg1Tx.each('end', function(d) {
          $seg2 = segment2(g, d)
          $seg2.each(function(d) {
            seg2Tx = segment2Tx.call(this, d)
            seg2Tx.each('end', function(d) {
              $seg3 = segment3(g, d)
              $seg3.each(function(d) {
                seg3Tx = segment3Tx.call(this, d)
                seg3Tx.each('end', function(d) {
                  $seg1.each(function(d) {
                    seg1Tx2 = segment1Tx2.call(this, d)
                    seg1Tx2.each('end', function(d) {
                      this.remove()
                      $seg2.each(function(d) {
                        seg2Tx2 = segment2Tx2.call(this, d)
                        seg2Tx2.each('end', function(d) {
                          this.remove()
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  }

  function point(g, d) {
    return g
      .append('circle')
      .attr('r', 4)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .style('opacity', 0)
  }

  function pop(d) {
    d3
      .select(this)
      .transition()
      .duration(40 * opts.speed)
      .ease('in')
      .attr('r', 8)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .style('opacity', 1)
      .style('fill', 'gray')
      .each('end', puff)
  }

  function puff(d) {
    d3
      .select(this)
      .transition()
      .duration(160 * opts.speed)
      .ease('out')
      .attr('r', 24)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .style('opacity', 0)
      .each('end', function() {
        this.remove()
      })
  }

  function segment1(g, d) {
    return g
      .append('line')
      .attr('r', 4)
      .attr('x1', d => d.x)
      .attr('y1', d => d.y)
      .attr('x2', d => d.x)
      .attr('y2', d => d.y)
      .style('opacity', 0)
  }

  function segment1Tx(d) {
    return d3
      .select(this)
      .transition()
      .duration(100 * opts.speed)
      .ease('linear')
      .attr('x1', d => d.x)
      .attr('y1', d => d.y)
      .attr('x2', opts.lineToQueue.x1)
      .attr('y2', d => d.y)
      .style('opacity', 1)
      .style('stroke', 'orange')
      .style('stroke-width', '10')
      .style('stroke-linecap', 'round')
  }

  function segment1Tx2(d) {
    return d3
      .select(this)
      .transition()
      .duration(100 * opts.speed)
      .ease('linear')
      .attr('x1', opts.lineToQueue.x1)
      .attr('y1', d => d.y)
      .attr('x2', opts.lineToQueue.x1)
      .attr('y2', d => d.y)
  }

  function segment2(g, d) {
    const { x1: lx1 } = opts.lineToQueue
    return g
      .append('line')
      .attr('id', `_q1_${d.id}`)
      .attr('x1', lx1)
      .attr('y1', d.y)
      .attr('x2', lx1)
      .attr('y2', d.y)
      .style('opacity', 1)
      .style('stroke-width', '10')
      .style('stroke-linecap', 'round')
      .style('stroke', 'red')
  }

  function segment2Tx(d) {
    const { x1: qx1, x2: qx2, y: qy } = opts.queue
    return d3
      .select(this)
      .transition()
      .duration(100 * opts.speed)
      .ease('linear')
      .attr('x1', opts.lineToQueue.x1)
      .attr('y1', d.y)
      .attr('x2', qx1)
      .attr('y2', d => getPosition(d))
      .style('opacity', 1)
  }

  function segment2Tx2(d) {
    const { x1: qx1, x2: qx2, y: qy } = opts.queue
    return d3
      .select(this)
      .transition()
      .duration(100 * opts.speed)
      .ease('linear')
      .attr('x1', qx1)
      .attr('y1', d => getPosition(d))
      .attr('x2', qx1)
      .attr('y2', d => getPosition(d))
  }

  function segment3(g, d) {
    const { x1: qx1, x2: qx2, y: qy } = opts.queue
    return g
      .append('line')
      .attr('id', `_q2_${d.id}`)
      .attr('x1', qx1)
      .attr('y1', d => getPosition(d))
      .attr('x2', qx2)
      .attr('y2', d => getPosition(d))
      .attr('stroke-width', d.work * 10)
      .style('stroke-linecap', 'butt')
      .style('stroke', 'blue')
      .style('opacity', 1)
  }

  function segment3Tx(d) {
    const { x1: qx1, x2: qx2, y: qy } = opts.queue
    return d3
      .select(this)
      .transition()
      .duration(100 * opts.speed)
      .ease('linear')
      .attr('x1', qx1)
      .attr('y1', d => getPosition(d))
      .attr('x2', qx2)
      .attr('y2', d => getPosition(d))
      .style('opacity', 1)
  }

  function segment3Tx2(d) {
    const { x1: qx1, x2: qx2, y: qy } = opts.queue
    return d3
      .select(this)
      .transition()
      .duration(100 * opts.speed)
      .ease('linear')
      .attr('x1', qx1)
      .attr('y1', d => getPosition(d))
      .attr('x2', qx2)
      .attr('y2', d => getPosition(d))
      .style('opacity', 1)
  }

  function fade(d) {
    d3
      .select(this)
      .transition()
      .duration(200 * opts.speed)
      .ease('out')
      .style('opacity', 0)
      .each('end', function() {
        this.remove()
      })
  }

  function getPosition(d) {
    console.log({
      d,
      queueFloor: opts.queue.y,
      workPosition,
      position: opts.queue.y - (d.pos - workPosition)
    })
    return opts.queue.y - (d.pos - workPosition)
  }

  function setPosition() {
    const last = workQueue[workQueue.length - 1]
    const next = last ? last.pos + last.work : 0
    return Math.max(next, workPosition)
  }

  const startLoop = () => {
    interval = setInterval(() => {
      redraw()
    }, 16)
  }

  const stopLoop = () => {
    clearInterval(interval)
  }

  const addData = (x, y, work) => {
    const pos = setPosition()
    console.log({ pos })
    const data = { id: workQueue.length, pos, x, y, work }
    workQueue.push(data)
    dataset = [data]
  }

  return {
    startLoop,
    stopLoop,
    addData
  }
}
