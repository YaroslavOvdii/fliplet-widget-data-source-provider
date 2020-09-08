export const getDataSources = (appId) => {
  const getOptions = appId ? { appId } : {};

  return Fliplet.DataSources.get(getOptions);
};

export const getDataSource = (dataSourceId) => {
  return Fliplet.DataSources.getById(dataSourceId);
};

export const createDataSource = (widgetData) => {
  return Fliplet.Modal.prompt({
    title: 'Enter a name for the data source',
    value: widgetData.default.name
  })
    .then(dataSourceName => {
      if (dataSourceName === null) {
        return;
      }

      if (!dataSourceName) {
        return Fliplet.Modal.alert({
          message: 'Data source name can\'t be empty. Plaese enter data source name again.'
        })
          .then(() => {
            createDataSource(widgetData);
          });
      }

      return Fliplet.DataSources.create({
        name: dataSourceName,
        appId: widgetData.appId,
        entries: widgetData.default.entries,
        columns: widgetData.default.columns
      });
    });
};

export const updateDataSourceSecurityRules = (dataSourceId, securityRules) => {
  return Fliplet.DataSources.update(dataSourceId, {
    accessRules: securityRules
  });
};
