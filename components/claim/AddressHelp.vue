<template>
  <details class="ah">
    <summary class="ah-summary">
      <img src="/flow-icons/magnifier.png" alt="" class="ah-ic" />
      Can't find your address?
      <svg class="ah-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </summary>
    <ul class="ah-tips">
      <li>Search by <strong>postcode only</strong> (for example <em>SK7 4BL</em>), then pick your home from the list.</li>
      <li>Try the <strong>house number and street</strong>, e.g. <em>12 Mill Lane</em>.</li>
      <li>Flats and new builds are often listed under the <strong>building name</strong>.</li>
    </ul>
  </details>
</template>

<style scoped>
.ah {
  margin-top: 10px;
  border-radius: 14px;
  border: 1px solid #e7ecf2;
  background: rgba(255, 255, 255, 0.7);
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-align: left;
}
.ah[open] {
  background: #fff;
}

.ah-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  list-style: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
  user-select: none;
}
.ah-summary::-webkit-details-marker {
  display: none;
}

.ah-ic {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.ah-chev {
  width: 14px;
  height: 14px;
  margin-left: auto;
  color: #8a94a6;
  transition: transform 0.18s;
}
.ah[open] .ah-chev {
  transform: rotate(180deg);
}

.ah-tips {
  margin: 0;
  padding: 0 14px 12px 32px;
  display: grid;
  gap: 6px;
  font-size: 12.5px;
  line-height: 1.5;
  color: #4a5570;
}
.ah-tips strong {
  color: #231d45;
}
.ah-tips em {
  font-style: normal;
  font-weight: 700;
  color: #00857f;
}
</style>
