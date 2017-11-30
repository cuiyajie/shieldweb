import $ from 'jquery';
import Chart from 'chart.js';

import { IDENTITY_BOUND } from './constants';

// reference http://jsfiddle.net/cd3fdoy9/
Chart.pluginService.register({
		afterUpdate: function (chart) {
			if (chart.config.options.elements.arc.roundedCornersFor !== undefined) {
				var arc = chart.getDatasetMeta(0).data[chart.config.options.elements.arc.roundedCornersFor];
				arc.round = {
					x: (chart.chartArea.left + chart.chartArea.right) / 2,
					y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
					radius: (chart.outerRadius + chart.innerRadius) / 2,
					thickness: (chart.outerRadius - chart.innerRadius) / 2,
					backgroundColor: arc._model.backgroundColor
				}
			}
		},

		afterDraw: function (chart) {
			if (chart.config.options.elements.arc.roundedCornersFor !== undefined) {
				var ctx = chart.chart.ctx;
				var arc = chart.getDatasetMeta(0).data[chart.config.options.elements.arc.roundedCornersFor];
				var startAngle = Math.PI / 2 - arc._view.startAngle;
				var endAngle = Math.PI / 2 - arc._view.endAngle;

				ctx.save();
				ctx.translate(arc.round.x, arc.round.y);
				ctx.fillStyle = arc.round.backgroundColor;
				ctx.beginPath();
				ctx.arc(arc.round.radius * Math.sin(startAngle), arc.round.radius * Math.cos(startAngle), arc.round.thickness, 0, 2 * Math.PI);
				ctx.arc(arc.round.radius * Math.sin(endAngle), arc.round.radius * Math.cos(endAngle), arc.round.thickness, 0, 2 * Math.PI);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
			}
		},
	});

function getConfig(ctx, percent, size) {
  var gradient = ctx.createLinearGradient(245, 0, 0, 245);
  gradient.addColorStop(0, '#FF7927');
  gradient.addColorStop(0.5, '#A9698C');   
  gradient.addColorStop(1, '#7859FF');

  var config = {
    type: 'doughnut',
    data: {
      labels: [ "same" ],
      datasets: [{
        data: [percent, 100 - percent],
        backgroundColor: [ gradient, 'rgba(0, 0, 0, 0)' ],
        hoverBackgroundColor: [ gradient, 'rgba(0, 0, 0, 0)' ],
        borderWidth: [0, 0]
      }]
    },
    options: {
      cutoutPercentage: 88,
      elements: {
        arc: {
          roundedCornersFor: 0
        }
      },
      legend: { display: false },
      tooltips: { enabled: false }
    }
  };
  return config;
}

export default class ResultPage {
  constructor(options) {
    this.$el = $('#result');
    this.canvas = this.$el.find('#canvas')[0];
    this.label  = this.$el.find('.label');
    this.percent = options.percent || 0;
    this.complete = options.complete;
    this.bindEvent();
  }

  show() {
    if (this.percent > IDENTITY_BOUND) {
      this.label.removeClass('fail').addClass('success');
      this.label.html('判定结果：用户与身份证肖像一致');
    } else {
      this.label.removeClass('success').addClass('fail');
      this.label.html('判定结果：用户与身份证肖像不一致');
    }
    const percent = Math.round(this.percent * 100);
    this.$el.find('.percent').html(percent);

    const ctx = this.canvas.getContext('2d');
    new Chart(this.canvas, getConfig(ctx, percent, this.canvas.clientWidth));
  }

  bindEvent() {
    this.$el.find('button').on('click', () => {
      if (this.complete) {
        this.complete();
      }
    });
  }
};