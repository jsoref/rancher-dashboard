import debounce from 'lodash/debounce';

// Use a visible display type to reduce flickering
const displayType = 'inline-block';

export default {

  data() {
    return {
      bulkActionsClass:            'bulk',
      bulkActionClass:             'bulk-action',
      bulkActionsDropdownClass:    'bulk-actions-dropdown',
      bulkActionAvailabilityClass: 'action-availability',

      hiddenActions: [],
    };
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateHiddenBulkActions);
  },

  mounted() {
    window.addEventListener('resize', this.updateHiddenBulkActions);
    this.updateHiddenBulkActions();
  },

  watch: {
    selectedRows() {
      this.updateHiddenBulkActions();
    },
    keyedAvailableActions() {
      this.updateHiddenBulkActions();
    },
    tableSelected(neu) {
      if (!neu?.length) {
        // Ensure the popover is closed when there are no enabled actions.
        // Otherwise there's a bug ...
        // 1. select a row
        // 2. show popover by clicking on action drop down button,
        // 3. deselect the row
        // 4. select the row
        // 5. click action drop down button and popover fails to show
        this.$refs.actionDropDown?.click();
      }
    }
  },

  computed: {
    hasSelectionStore() {
      // Computed properties that reference availableActions before the selection store is initialised will fail
      // (the forTable is null). Making this conditional (`x || []`) makes the action array always `[]`
      // So block until the store is ready
      // Note - this.$store.hasModule(this.storeName) isn't reactive
      return !!this.$store.state[this.storeName];
    },

    availableActions() {
      return this.$store.getters[`${ this.storeName }/forTable`].filter(act => !act.external);
    },

    keyedAvailableActions() {
      return this.hasSelectionStore ? this.availableActions.map(aa => aa.action) : null;
    },

    selectedRows() {
      if (!this.hasSelectionStore || !this.tableSelected || this.tableSelected.length === 0) {
        return null;
      }

      return this.tableSelected.length;
    },

    selectedRowsText() {
      if (!this.selectedRows) {
        return null;
      }

      return this.t('sortableTable.actionAvailability.selected', { actionable: this.selectedRows });
    },

    actionTooltip() {
      if (!this.selectedRows || !this.actionOfInterest) {
        return null;
      }

      const runnableTotal = this.tableSelected.filter(this.canRunBulkActionOfInterest).length;

      if (runnableTotal === this.selectedRows) {
        return null;
      }

      return this.t('sortableTable.actionAvailability.some', {
        actionable: runnableTotal,
        total:      this.selectedRows,
      });
    },
  },

  methods: {
    /**
     * Determine if any actions wrap over to a new line, if so group them into a dropdown instead
     */
    updateHiddenBulkActions: debounce(function() {
      const actionsContainer = this.$refs.container.querySelector(`.${ this.bulkActionsClass }`);
      const actionsDropdown = this.$refs.container.querySelector(`.${ this.bulkActionsDropdownClass }`);

      if (!actionsContainer || !actionsDropdown) {
        return;
      }

      const actionsContainerWidth = actionsContainer.offsetWidth;
      const actionsHTMLCollection = this.$refs.container.querySelectorAll(`.${ this.bulkActionClass }`);
      const actions = Array.from(actionsHTMLCollection || []);

      // Determine if the 'x selected' label should show and it's size
      const selectedRowsText = this.$refs.container.querySelector(`.${ this.bulkActionAvailabilityClass }`);
      let selectedRowsTextWidth = 0;

      if (this.selectedRowsText) {
        if (selectedRowsText) {
          selectedRowsText.style.display = displayType;
          selectedRowsTextWidth = selectedRowsText.offsetWidth;
        } else {
          selectedRowsText.style.display = 'none;';
        }
      }

      this.hiddenActions = [];

      let cumulativeWidth = 0;
      let showActionsDropdown = false;
      let totalAvailableWidth = actionsContainerWidth - selectedRowsTextWidth;

      // Loop through all actions to determine if some exceed the available space in the row, if so hide them and instead show in a dropdown
      for (let i = 0; i < actions.length; i++) {
        const ba = actions[i];

        ba.style.display = displayType;
        const actionWidth = ba.offsetWidth;

        cumulativeWidth += actionWidth + 15;
        if (cumulativeWidth >= totalAvailableWidth) {
          // There are too many actions so the drop down will be visible.
          if (!showActionsDropdown) {
            // If we haven't previously enabled the drop down...
            actionsDropdown.style.display = displayType;
            // By showing the drop down some previously visible actions may now be hidden, so start the process again
            // ... except taking into account the width of drop down width in the available space
            i = -1;
            cumulativeWidth = 0;
            showActionsDropdown = true;
            totalAvailableWidth = actionsContainerWidth - actionsDropdown.offsetWidth - selectedRowsTextWidth;
          } else {
            // Collate the actions in an array and hide in the normal row
            const id = ba.attributes.getNamedItem('id').value;

            this.hiddenActions.push(this.availableActions.find(aa => aa.action === id));
            ba.style.display = 'none';
          }
        }
      }

      if (!showActionsDropdown) {
        actionsDropdown.style.display = 'none';
      }
    }, 10)
  }
};
