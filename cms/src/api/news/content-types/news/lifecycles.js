'use strict';

function parseTagMultiselect(raw) {
  if (raw == null || raw === '') return [];
  const s = String(raw).trim();
  if (!s) return [];
  return s
    .split(',')
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function applyTagMultiselect(data) {
  if (data.tag_multiselect === undefined) return;
  const ids = parseTagMultiselect(data.tag_multiselect);
  data.tags = ids;
  data.tag_multiselect = ids.length ? ids.join(',') : '';
}

module.exports = {
  beforeCreate(event) {
    applyTagMultiselect(event.params.data);
  },

  beforeUpdate(event) {
    applyTagMultiselect(event.params.data);
  },
};
