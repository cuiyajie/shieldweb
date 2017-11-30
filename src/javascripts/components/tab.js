import $ from 'jquery';

const Tab = {
  init(val) {
    this.$tabs = $('[data-tab]');
    this.$tabTargets = $('[data-tab-target]');
    this.handleTabClick(val);
    this.$tabs.on('click', this.onTabClick.bind(this));
  },
  handleTabClick(val) {
    this.$tabs.each(function(i, t) {
      var $t = $(t);
      if ($t.attr('data-tab') !== val) {
        $t.removeClass('active');
      } else {
        $t.addClass('active');
      }
    });
    this.$tabTargets.each(function(i, tt) {
      var $tt = $(tt);
      if ($tt.attr('data-tab-target') !== val) {
        $tt.removeClass('active');
      } else {
        $tt.addClass('active');
      }
    });
  },
  onTabClick(event) {
    var $tab = $(event.target).closest('[data-tab]');
    var val = $tab.attr('data-tab');
    this.handleTabClick.call(this, val);
  },
};

export default Tab;