<script>
import CreateEditView from '@/mixins/create-edit-view';
import UnitInput from '@/components/form/UnitInput';

export default {
  name: 'HarvesterOvercommitConfig',

  components: { UnitInput },

  mixins: [CreateEditView],

  data() {
    let parseDefaultValue = {};

    try {
      parseDefaultValue = JSON.parse(this.value.value);
    } catch (error) {
      parseDefaultValue = JSON.parse(this.value.default);
    }

    return {
      parseDefaultValue,
      errors: []
    };
  },

  created() {
    this.update();
  },

  methods: {
    update() {
      const value = JSON.stringify(this.parseDefaultValue);

      this.$set(this.value, 'value', value);
    }
  },

  watch: {
    value: {
      handler(neu) {
        const parseDefaultValue = JSON.parse(neu.value);

        this.$set(this, 'parseDefaultValue', parseDefaultValue);
      },
      deep: true
    }
  }
};
</script>

<template>
  <div class="row" @input="update">
    <div class="col span-12">
      <template>
        <UnitInput
          v-model="parseDefaultValue.cpu"
          v-int-number
          label-key="harvester.generic.cpu"
          suffix="%"
          required
          :mode="mode"
          class="mb-20"
        />

        <UnitInput
          v-model="parseDefaultValue.memory"
          v-int-number
          label-key="harvester.generic.memory"
          suffix="%"
          required
          :mode="mode"
          class="mb-20"
        />

        <UnitInput
          v-model="parseDefaultValue.storage"
          v-int-number
          label-key="harvester.generic.storage"
          suffix="%"
          required
          :mode="mode"
          class="mb-20"
        />
      </template>
    </div>
  </div>
</template>
