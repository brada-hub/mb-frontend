<template>
  <q-card class="stat-card" :class="`stat-card--${color}`">
    <q-card-section class="stat-card__content">
      <div class="stat-card__icon" :style="{ backgroundColor: `var(--q-${color})20` }">
        <q-icon :name="icon" :color="color" size="24px" />
      </div>
      <div class="stat-card__info">
        <div class="stat-card__label text-grey">{{ label }}</div>
        <div class="stat-card__value" :class="{ 'text-h5': !isMoney, 'text-h6': isMoney }">
          {{ value }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value: string | number;
  color?: string;
  isMoney?: boolean;
}>();
</script>

<style lang="scss" scoped>
.stat-card {
  background: var(--mb-bg-card) !important;
  border: 1px solid var(--mb-border);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__info {
    flex: 1;
  }

  &__label {
    font-size: 0.85rem;
    margin-bottom: 4px;
  }

  &__value {
    font-weight: 700;
    color: var(--mb-text-primary);
  }
}
</style>
