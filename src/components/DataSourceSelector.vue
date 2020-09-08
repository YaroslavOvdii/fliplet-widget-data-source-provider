<template>
  <section class="data-source-selector">
    <div v-if="dataSources.length && !selectedDataSource">
      <Select2
        :dataSources="dataSources"
        :selectedDataSource="selectedDataSource"
        :customOptionView="formatDataSourceOption"
        :customSearch="customDataSourceSearch"
        :optionLabelKey="'name'"
        :optionValueKey="'id'"
        :selectWithGroups="!!otherDataSources.length"
        @selectDataSource="setDataSource">
        </Select2>
      <span @click="onDataSourceCreate" class="btn-link create-data-source">Create new data source</span>
      <div class="checkbox checkbox-icon">
        <input @change="showAllDataSources" :checked="showAll" type="checkbox" name="showAll" id="showAll" />
        <label for="showAll">
          <span class="check">
            <i class="fa fa-check"></i>
          </span>
          Show all data sources
        </label>
      </div>
    </div>
    <div v-else-if="dataSources.length && selectedDataSource && !changeDataSource">
      <p>{{ selectedDataSource.id }}. {{ selectedDataSource.name }} <span @click="onDataSourceChange" class="btn-link change-data-source">Change</span></p>
      <div @click="viewDataSource" class="btn btn-default btn-view-data-source">View data source</div>
    </div>
    <div v-else-if="dataSources.length && selectedDataSource && changeDataSource">
      <Select2
        :dataSources="dataSources"
        :selectedDataSource="selectedDataSource"
        :customOptionView="formatDataSourceOption"
        :customSearch="customDataSourceSearch"
        :optionLabelKey="'name'"
        :optionValueKey="'id'"
        :selectWithGroups="!!otherDataSources.length"
        @selectDataSource="setDataSource">
      </Select2>
      <span @click="onDataSourceCreate" class="btn-link create-data-source">Create new data source</span>
      <div class="checkbox checkbox-icon">
        <input @change="showAllDataSources" :checked="showAll" type="checkbox" name="showAll" id="showAll" />
        <label for="showAll">
          <span class="check">
            <i class="fa fa-check"></i>
          </span>
          Show all data sources
        </label>
      </div>
      <div @click="viewDataSource" class="btn btn-default btn-view-data-source">View data source</div>
    </div>
  </section>
</template>

<script>
import Select2 from './Select2';

export default {
  data() {
    return {
      dataSources: []
    };
  },
  props: {
    currentAppDataSources: {
      type: Array,
      default() {
        return [];
      }
    },
    otherDataSources: {
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
    },
    changeDataSource: {
      type: Boolean,
      default: false
    },
    showAll: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onDataSourceChange: function() {
      this.$emit('onDataSourceChange');
    },
    onDataSourceCreate: function() {
      this.$emit('onDataSourceCreate');
    },
    showAllDataSources: function(event) {
      this.$emit('onShowAll', event.target.checked);
      this.formatDataSources();
    },
    formatDataSources: function() {
      // If the otherDataSources array is empty it means that we show the user only data sources for the current app
      if (!this.otherDataSources.length) {
        return this.sortDataSourceEntries(this.currentAppDataSources);
      }

      const allDataSources = [
        {
          name: 'This app',
          options: []
        },
        {
          name: 'Other apps',
          options: []
        }
      ];

      allDataSources[0].options = this.sortDataSourceEntries(this.currentAppDataSources);
      allDataSources[1].options = this.sortDataSourceEntries(this.getOtherAppsDataSources(this.otherDataSources));

      return allDataSources;
    },
    getOtherAppsDataSources: function(dataSources) {
      return dataSources.filter(dataSource => {
        return this.currentAppDataSources.findIndex(currDS => currDS.id === dataSource.id) === -1;
      });
    },
    formatDataSourceOption: function(data) {
      const { id, name, text } = data;

      return `${name || text} ID: ${id}`;
    },
    customDataSourceSearch: function(condition, data) {
      // Return of this function should be the same as the array.filter function
      // If there are no search terms, return all of the data
      if (!condition) {
        return true;
      }

      const term = condition.toUpperCase();
      const name = data.name.toUpperCase();
      const id = data.id.toString();

      // Search both by name and id
      if (name.indexOf(term) > -1 || id.indexOf(term) > -1) {
        return true;
      }

      // Return `false` if the term should not be displayed
      return false;
    },
    setDataSource: function(dataSource) {
      if (dataSource) {
        this.selectedDataSource = dataSource;

        Fliplet.Widget.emit('showColumns', {
          columns: dataSource.columns,
          id: dataSource.id
        });

        this.$emit('onDataSourceSelect', dataSource);
      }
    },
    sortDataSourceEntries: function(dataSources) {
      const copyDataSources = [...dataSources];

      if (copyDataSources[0].options) {
        copyDataSources[0].options.sort(this.sortArray);
        copyDataSources[1].options.sort(this.sortArray);
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
    viewDataSource: function() {
      Fliplet.Studio.emit('overlay', {
        name: 'widget',
        options: {
          size: 'large',
          package: 'com.fliplet.data-sources',
          title: 'Edit Data Sources',
          classes: 'data-source-overlay',
          data: {
            context: 'overlay',
            dataSourceId: this.selectedDataSource.id
          }
        }
      });
    }
  },
  components: {
    Select2
  },
  mounted: function() {
    this.dataSources = this.formatDataSources();
  },
  updated: function() {
    Fliplet.Widget.autosize();
  }
};
</script>
