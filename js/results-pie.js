const fakeData = [
  { choice: 'a', count: 4 },
  { choice: 'b', count: 2 },
  { choice: 'c', count: 1 },
  { choice: 'd', count: 2 }
]

function resultsPie(opts) {
  const svg = d3.select(opts.$el)
  const width = +svg.attr('width')
  const height = +svg.attr('height')
  const radius = Math.min(width, height) / 2
  const g = svg
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

  var color = d3.scaleOrdinal([
    '#ff0000',
    '#ffff00',
    '#008800',
    '#0000ff'
  ])

  var pie = d3
    .pie()
    .sort(null)
    .value(function(d) {
      return d.count
    })

  var path = d3
    .arc()
    .outerRadius(radius - 10)
    .innerRadius(30)

  var label = d3
    .arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40)

  const update = data => {
    var arc = g
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')

    arc
      .append('path')
      .attr('d', path)
      .attr('fill', function(d) {
        return color(d.data.choice)
      })

    arc
      .append('text')
      .attr('transform', function(d) {
        return 'translate(' + label.centroid(d) + ')'
      })
      .attr('dy', '0.35em')
      .text(function(d) {
        return d.data.choice
      })
  }

  update(opts.data = fakeData)
  return { update }
}
