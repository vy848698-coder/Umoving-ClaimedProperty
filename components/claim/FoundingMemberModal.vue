<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fmm-overlay" @click.self="viewPassport">
      <div class="fmm-modal">
        <div class="fmm-handle" />
        <div class="fmm-icon"><img src="/homescore-icon/trophy.png" alt="" /></div>

        <div class="fmm-eyebrow">Founding Homeowner</div>
        <h2 class="fmm-title">
          {{ firstClaim ? 'Welcome' : 'Another one claimed' }}, Founding Member{{ numberLabel ? ` ${numberLabel}` : '' }}
        </h2>
        <p v-if="firstClaim" class="fmm-body">
          You're officially one of the first 1,000,000 people to claim a
          property with us. We've emailed a copy of your certificate to your
          registered address — you can also view or download it any time from
          the Certificate page in your Profile menu.
        </p>
        <p v-else class="fmm-body">
          This property now has its own certificate, showing its address and
          Passport code under the same founder number. We've emailed you a copy
          — you can also view or download a certificate for any property you've
          claimed from the Certificate page in your Profile menu.
        </p>

        <div class="fmm-actions">
          <button type="button" class="fmm-btn-primary" @click="viewPassport">
            View my Passport →
          </button>
          <button type="button" class="fmm-btn-link" @click="viewCertificate">
            View certificate now
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    numberLabel?: string | null
    passportPath: string
    // This claim's certificate, not the bare /certificate page: the endpoint
    // would otherwise resolve it for whichever property is newest by then.
    certificatePath?: string
    // False once they have claimed more than one property - they are already a
    // Founding Homeowner, so the welcome is worded differently.
    firstClaim?: boolean
  }>(),
  { numberLabel: null, certificatePath: '', firstClaim: true },
)
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

function close() {
  emit('update:modelValue', false)
}

function viewPassport() {
  close()
  navigateTo(props.passportPath, { replace: true })
}

function viewCertificate() {
  close()
  navigateTo(props.certificatePath || '/certificate', { replace: true })
}
</script>

<style scoped>
.fmm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14, 40, 64, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 80;
  animation: fmm-fade 0.2s ease;
}
@keyframes fmm-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fmm-modal {
  width: 100%;
  max-width: 26rem;
  background: linear-gradient(180deg, #ffffff 0%, #f2fbf9 100%);
  border-radius: 24px;
  padding: 8px 26px 26px;
  text-align: center;
  box-shadow: 0 30px 80px rgba(14, 40, 64, 0.34);
  animation: fmm-pop 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes fmm-pop {
  from { opacity: 0; transform: translateY(14px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.fmm-handle { display: none; }

@media (max-width: 640px) {
  .fmm-overlay { align-items: flex-end; padding: 0; }
  .fmm-modal {
    max-width: none;
    border-radius: 24px 24px 0 0;
    padding: 8px 20px calc(22px + env(safe-area-inset-bottom));
    animation: fmm-up 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .fmm-handle {
    display: block;
    width: 36px;
    height: 4px;
    background: #d9dae0;
    border-radius: 100px;
    margin: 10px auto 2px;
  }
}
@keyframes fmm-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.fmm-icon {
  width: 76px;
  height: 76px;
  margin: 14px auto 6px;
}
.fmm-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fmm-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #00857f;
  margin-bottom: 6px;
}
.fmm-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px;
  line-height: 1.25;
  margin: 0 0 10px;
}
.fmm-body {
  font-size: 13.5px;
  font-weight: 500;
  color: #5b6d89;
  line-height: 1.55;
  margin: 0 0 22px;
}

.fmm-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fmm-btn-primary {
  width: 100%;
  padding: 14px 18px;
  background: linear-gradient(135deg, #00a19a 0%, #00b6ae 60%, #0f8f88 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(0, 161, 154, 0.3);
}
.fmm-btn-link {
  width: 100%;
  padding: 6px;
  background: transparent;
  border: none;
  color: #00857f;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
</style>
