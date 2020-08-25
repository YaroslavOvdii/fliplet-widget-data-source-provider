<template>
  <section>
    <div v-if="isLoading" class="spinner-holder animated">
      <div class="spinner-overlay">Loading...</div>
    </div>
    <div v-else-if="hasError" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>
    <div v-else class="main-data-source-provider">
      <DataSourceSelector
        :currentAppDataSources="appDataSources" :otherDataSources="allDataSources"
        :selectedDataSource="selectedDataSource"
        :changeDataSource="changeDataSource"
        :showAll="showAll"
        @selectedDataSource="(event) => { selectedDataSource = event }"
        @onDataSourceCreate="createDS"
        @onShowAll="(event) => { showAllDataSources(event) }"
        @onDataSourceChange="changeDataSource = !changeDataSource"
      >
      </DataSourceSelector>
      <SecurityNotifier v-show="selectedDataSource"
        :securityEnabled="isAccessRulesPresents()"
        @updateSecurityRules="updateSecurityDefaults"
      >
      </SecurityNotifier>
    </div>
  </section>

</template>

<script>
import DataSourceSelector from './components/DataSourceSelector';
import SecurityNotifier from './components/SecurityNotifier';
import { getDataSources, getDataSource, createDataSource, updateDataSourceSecurityRules } from './services/dataSource';

export default {
  data() {
    return {
      appDataSources: [],
      allDataSources: [],
      copyOfAllDataSources: [],
      isLoading: true,
      hasError: false,
      errorMessage: '',
      widgetData: {},
      selectedDataSource: false,
      changeDataSource: false,
      showAll: false
    };
  },
  methods: {
    isAccessRulesPresents: function() {
      if (!this.selectedDataSource) {
        return;
      }

      if (this.selectedDataSource.accessRules === null || !this.selectedDataSource.accessRules.length) {
        return false;
      }

      return true;
    },
    updateSecurityDefaults: function() {
      this.isLoading = true;
      this.selectedDataSource.accessRules = this.widgetData.accessRules;

      updateDataSourceSecurityRules(this.selectedDataSource.id, this.selectedDataSource.accessRules)
        .then(() => {
          Fliplet.Modal.alert({
            message: 'Your changes have been applied to all affected apps.'
          });
        })
        .catch(err => {
          this.hasError = true;
          this.errorMessage = Fliplet.parseError(err);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    showAllDataSources: function(isChecked) {
      this.isLoading = true;
      this.showAll = isChecked;

      if (isChecked) {
        if (!this.copyOfAllDataSources.length) {
          this.loadDataSources();
          return;
        }

        this.allDataSources = [...this.copyOfAllDataSources];
      } else {
        this.copyOfAllDataSources = [...this.allDataSources];
        this.allDataSources = [];
      }

      // Give VUE time to reset templates
      setTimeout(() => {
        this.isLoading = false;
      }, 100);
    },
    loadDataSources: function(appId) {
      this.isLoading = true;

      getDataSources(appId)
        .then(dataSources => {
          if (this.widgetData.dataSourceId) {
            this.selectedDataSource = dataSources.find(dataSource => dataSource.id === this.widgetData.dataSourceId);

            if (!this.selectedDataSource) {
              return getDataSource(this.widgetData.dataSourceId)
                .then(dataSorce => {
                  this.selectedDataSource = dataSorce;
                  dataSources.push(dataSorce);
                  return dataSources;
                });
            }
          } else {
            // To insure that user can reselect data source after first selection
            this.changeDataSource = true;
          }

          return dataSources;
        })
        .then(dataSources => {
          if (appId) {
            this.appDataSources = dataSources;
          } else {
            this.allDataSources = dataSources;
          }
        })
        .catch(err => {
          this.hasError = true;
          this.errorMessage = Fliplet.parseError(err);
        })
        .finally(() => {
          this.isLoading = false;
          Fliplet.Widget.autosize();
        });
    },
    initProvider() {
      this.widgetData = Fliplet.Widget.getData();

      this.loadDataSources(this.widgetData.appId);
    },
    createDS: function() {
      this.isLoading = true;

      createDataSource(this.widgetData)
        .then(dataSource => {
          if (!dataSource) {
            return;
          }

          this.selectedDataSource = dataSource;
        })
        .catch(err => {
          this.hasError = true;
          this.errorMessage = Fliplet.parseError(err);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    saveRequestListener: function() {
    }
  },
  components: {
    DataSourceSelector,
    SecurityNotifier
  },
  mounted: function() {
    this.initProvider();

    const $vm = this;

    // Transfer selected DataSource id to the parent
    Fliplet.Widget.onSaveRequest(function() {
      Fliplet.Widget.save({id: $vm.selectedDataSource ? $vm.selectedDataSource.id : undefined});
    });
  },
  updated: function() {
    Fliplet.Widget.autosize();
  }
};
</script>
