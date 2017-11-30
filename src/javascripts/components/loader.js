import $ from 'jquery';
import Pace from 'pace-progress';
import { watch, unwatch } from 'melanke-watchjs';

export default class Loader {
  constructor(options) {
    this.options = options || {};

    this.$el = $('#loading');
    this.$percent = this.$el.find('.percent');
    this.$li = this.$el.find('ul.loader li');
    this.$li.attr('class', 'unload');

    this.tasks = [];
    this.Pace = Pace;
  }

  start() {
    Pace.start();

    watch(Pace.bar, 'progress', () => {
      const progress = parseInt(Pace.bar.progress, 10);
      if (progress < 100) {
        this.render(progress);
      }
    });

    Pace.on('done', () => {
      this.afterLoaded();
    });
  }

  afterLoaded() {
    unwatch(Pace.bar, 'progress');
    if (this.options.loaded) {
      this.options.loaded.call(this);
    }
  }
  

  render(progress) {
    this.$percent.html(`${progress}%`);
    const pos = Math.floor(progress / 20);
    this.$li.each(function(i, li) {
      li = $(li);
      if (i === pos) {
        li.attr('class', 'loading');
      } else if (i < pos) {
        li.attr('class', 'loaded');
      } else {
        li.attr('class', 'unload');
      }
    });
  }
}