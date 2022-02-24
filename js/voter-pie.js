const fakeData = [
  { choice: 'a', count: 4, color: '#ff0000' },
  { choice: 'b', count: 2, color: '#ffff00' },
  { choice: 'c', count: 0, color: '#008800' },
  { choice: 'd', count: 2, color: '#0000ff' }
]

const COLORS = {
  a: '#ff0000',
  b: '#ffff00',
  c: '#008800',
  d: '#0000ff'
}

function voterPie(opts) {
  let data = opts.data || fakeData
  const width = 200
  const height = 200
  const radius = Math.min(width, height) / 2

  var color = d3.scale.category20()

  var pie = d3.layout
    .pie()
    .value(d => d.count)
    .sort(null)
    
  var arc = d3.svg.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 20)

  var svg = d3
    .select(opts.$el)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

  var path = svg
    .datum(data)
    .selectAll('path')
    .data(pie)
    .enter()
    .append('path')
    .attr('fill', d => d.data.color)
    .attr('d', arc)
    .each(function(d) {
      this._current = d
    })

  function change() {
    pie.value(d => d.count)
    
    path
      .data(pie(data), d => d.data.choice)
      .transition()
      .duration(750)
      .attrTween('d', arcTween)
  }

  function update(_data) {
    const sum = _data.reduce((r, d) => r + d.count, 0)
    if (sum === 0) _data.push({ choice: 'e', count: 1, color: '#ffffff' })
    data = _data.map(d => {
      d.color = COLORS[d.choice]
      return d
    })
    change()
  }

  function arcTween(a) {
    var i = d3.interpolate(this._current, a)
    this._current = i(0)
    return function(t) {
      return arc(i(t))
    }
  }

  return { update }
}
