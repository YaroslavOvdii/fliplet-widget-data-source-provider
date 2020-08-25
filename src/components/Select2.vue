<template>
  <section>
    <select name="selectDatasource" ref="dataSourceSelect" data-label="select" class="hidden-select form-control">
      <option value="none" disable>-- Select data source</option>
    </select>
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
      $(this.$refs.dataSourceSelect).select2({
        data: this.sortDataSourceEntries(this.dataSources),
        placeholder: '-- Select a data source',
        templateResult: this.formatItem,
        templateSelection: this.formatItem,
        width: '100%',
        matcher: this.customDataSourceSearch,
        dropdownAutoWidth: false
      });
    },
    initHandlers: function() {
      const $vm = this;
      const $select2Ref = $(this.$refs.dataSourceSelect);
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
    formatItem: function(...{id, text, name}) {
      if (['none', 'currentAppDataSources', 'otherDataSources'].includes(id)) {
        return $(
          `<span class="select2-value-holder"> ${ text } </span>`
        );
      }

      return $(
        `<span class="select2-value-holder"> ${ name || text } <small>ID: ${ id } </small></span>`
      );
    },
    setSelectedValue: function(value) {
      if (!value) {
        return;
      }

      $(this.$refs.dataSourceSelect).val(value).trigger('change');
    }
  },
  mounted: function() {
    this.initSelect2();
    this.initHandlers();
    this.setSelectedValue(this.selectedDataSource);
  },
  updated: function() {
  }
};
</script>
