<script>
import { mapState } from 'vuex';

export default {
  data() {
    return { autoRemoveTimer: null };
  },

  computed: {
    ...mapState('growl', ['stack']),

    shouldRun() {
      return this.stack.length && this.stack.find(x => x.timeout > 0);
    }
  },

  watch: {
    stack() {
      if ( this.shouldRun ) {
        this.startAutoRemove();
      } else {
        this.stopAutoRemove();
      }
    },
  },

  methods: {
    close(growl) {
      this.$store.dispatch('growl/remove', growl.id);
    },

    closeAll() {
      this.$store.dispatch('growl/clear');
    },

    closeExpired() {
      const now = new Date().getTime();

      for ( const growl of this.stack ) {
        if ( !growl.timeout ) {
          continue;
        }

        if ( growl.started + growl.timeout < now ) {
          this.close(growl);
        }
      }
    },

    startAutoRemove() {
      if ( this.autoRemoveTimer || !this.shouldRun ) {
        return false;
      }

      this.autoRemoveTimer = setInterval(() => {
        this.closeExpired();
      }, 1000);

      return true;
    },

    stopAutoRemove() {
      if ( this.autoRemoveTimer ) {
        clearInterval(this.autoRemoveTimer);
        this.autoRemoveTimer = null;
      }
    },

    mouseEnter() {
      this.stopAutoRemove();
    },

    mouseLeave() {
      this.startAutoRemove();
    },
  }
};

</script>

<template>
  <div class="growl-container" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
    <div class="growl-list">
      <div v-for="growl in stack" :key="growl.id" :class="{'growl': true, ['bg-'+growl.color]: true}">
        <i class="close hand icon icon-close" @click="close(growl)" />
        <h3>{{ growl.title }}</h3>
        <p>{{ growl.message }}</p>
      </div>
    </div>
    <div v-if="stack.length > 1" class="text-right mr-10 mt-10">
      <button type="button" class="btn btn-sm role-primary" @click="closeAll">
        Clear All Notifications
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .growl-container {
    z-index: 15;
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;

    @media only screen and (min-width: map-get($breakpoints, '--viewport-7')) {
      width: 350px;
    }
  }

  .growl-list {
    max-height: calc(100vh - 50px);
    overflow: hidden;
  }

  .growl {
    border: 1px solid var(--border);
    border-radius: var(--border-radius);
    padding: 10px;
    margin: 10px;
    position: relative;

    .close {
      position: absolute;
      top: 0;
      right: 0;
      padding: 5px;
    }
  }
</style>
