<template>
  <section>
    <select name="selectDatasource" ref="selectDatasource" data-label="select" class="hidden-select form-control">
      <option value="none" disable>-- Select data source</option>
    </select>
    <div class="dropdown-holder" ref="dropdownHolder"></div>
  </section>
</template>

<script>
export default {
  props: {
    dataSources: {
      type: Array,
      default() {
        return [];
      }
    },
    selectedDataSource: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  methods: {
    customDataSourceSearch: function(params, data) {
      // If there are no search terms, return all of the data
      if (!params.term) {
        return data;
      }

      // Do not display the item if there is no 'text' property
      if (typeof data.text === 'undefined' || typeof data.name === 'undefined' || typeof data.id === 'undefined') {
        return null;
      }

      const term = params.term.toLowerCase();

      // Search when we get DataSources for all aps
      if (data.children) {
        const matchedChildren = data.children.filter(function(child) {
          const name = child.name.toLowerCase();
          const id = child.id.toString();

          if (name.indexOf(term) > -1 || id.indexOf(term) > -1) {
            return true;
          }
        });

        if (matchedChildren.length) {
          const modifiedData = {...data};

          modifiedData.children = matchedChildren;

          return modifiedData;
        }
      }

      // Search both by name and id
      if (data.name.indexOf(term) > -1 || data.id.indexOf(term) > -1) {
        return data;
      }

      // Return `null` if the term should not be displayed
      return null;
    },
    initSelect2: function() {
      $(this.$refs.selectDatasource).select2({
        data: this.sortDataSourceEntries(this.dataSources),
        placeholder: '-- Select a data source',
        templateResult: this.formatState,
        templateSelection: this.formatState,
        width: '100%',
        matcher: this.customDataSourceSearch,
        dropdownAutoWidth: false
      });
    },
    select2Listeners: function() {
      const $vm = this;
      const $select2Ref = $(this.$refs.selectDatasource);
      const $dataSourceSelector = $('.data-source-selector');

      $select2Ref.on('select2:select', function(e) {
        $vm.$emit('selectDataSource', e.params.data);
      });

      $select2Ref.on('select2:open', function() {
        $dataSourceSelector.css('paddingBottom', '110px');
        Fliplet.Widget.autosize();

        setTimeout(() => {
          $dataSourceSelector.css('paddingBottom', '45px');
        }, 50);
      });

      $select2Ref.on('select2:close', function() {
        setTimeout(() => {
          $dataSourceSelector.css('paddingBottom', '0');
          Fliplet.Widget.autosize();
        }, 100);
      });
    },
    sortDataSourceEntries: function(dataSources) {
      const copyDataSources = [...dataSources];

      if (copyDataSources[0].children) {
        copyDataSources[0].children.sort(this.sortArray);
        copyDataSources[1].children.sort(this.sortArray);
      } else {
        copyDataSources.sort(this.sortArray);
      }

      return copyDataSources;
    },
    sortArray: function(a, b) {
      // Sort data source array by name
      // Send names that starts with number to the end of the list
      const startsWithAlphabet = /^[A-Z,a-z]/;
      let aValue = a.name ? a.name.toUpperCase() : '}';
      let bValue = b.name ? b.name.toUpperCase() : '}';

      if (!startsWithAlphabet.test(bValue)) {
        bValue = `{${bValue}`;
      }

      if (!startsWithAlphabet.test(aValue)) {
        aValue = `{${aValue}`;
      }

      if (aValue < bValue) {
        return -1;
      }
      if (aValue > bValue) {
        return 1;
      }

      return 0;
    },
    formatState: function(state) {
      if (state.id === 'none' || state.id === 'currentAppDataSources' || state.id === 'otherDataSources') {
        return $(
          '<span class="select2-value-holder">' + state.text + '</span>'
        );
      }
      if (state.id === 'new') {
        return $(
          '<span class="select2-value-holder">' + state.text + '</span>'
        );
      }
      if (state.id === '------') {
        return $(
          '<span class="select2-value-holder">' + state.text + '</span>'
        );
      }
      if (typeof state.name === 'undefined' && typeof state.text !== 'undefined') {
        return $(
          '<span class="select2-value-holder">' + state.text + ' <small>ID: ' + state.id + '</small></span>'
        );
      }

      return $(
        '<span class="select2-value-holder">' + state.name + ' <small>ID: ' + state.id + '</small></span>'
      );
    },
    setSelectedDS: function(selectedDS) {
      if (!selectedDS) {
        return;
      }

      const $select2 = $(this.$refs.selectDatasource);

      $select2.val(selectedDS.id).trigger('change');
    }
  },
  mounted: function() {
    this.initSelect2();
    this.select2Listeners();
    this.setSelectedDS(this.selectedDataSource);
  },
  updated: function() {
  }
};
</script>
