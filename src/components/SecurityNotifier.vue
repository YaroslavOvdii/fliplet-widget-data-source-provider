<template>
  <section class="security-notify">
    <div v-if="!securityEnabled" class="alert alert-warning">
      <p><b>This data source is missing security rules.</b></p>
      <p>Configure security rules so the app can access the data</p>
      <div @click="onAddDefaultSecurity" class="btn btn-primary btn-security">Configure security rules</div>
    </div>
    <div v-else-if="securityEnabled" class="alert alert-success">
      Security rules added. To manage security rules click <b>View data source</b> above.
    </div>
  </section>
</template>

<script>
export default {
  props: {
    securityEnabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onAddDefaultSecurity: function() {
      this.$emit('addDefaultSecurity');
    }
  }
};
</script>
