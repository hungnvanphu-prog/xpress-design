import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  Typography,
  Field,
  FieldLabel,
  FieldHint,
  FieldError,
  IconButton,
} from '@strapi/design-system';
import { useCMEditViewDataManager, useFetchClient } from '@strapi/helper-plugin';
import { Check, Cross, Search, Spinner } from '@strapi/icons';
import { useIntl } from 'react-intl';

function parseStoredIds(raw) {
  if (raw == null || raw === '') return [];
  const s = String(raw).trim();
  if (!s) return [];
  return s
    .split(',')
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function idsFromRelationField(tags) {
  if (tags == null) return [];
  if (Array.isArray(tags)) {
    return tags
      .map((item) => {
        if (typeof item === 'number') return item;
        if (item && typeof item === 'object' && item.id != null) return Number(item.id);
        return NaN;
      })
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  if (typeof tags === 'object' && Array.isArray(tags.connect)) {
    return tags.connect
      .map((c) => (c && c.id != null ? Number(c.id) : NaN))
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  return [];
}

function tagRowLabel(row) {
  if (!row || typeof row !== 'object') return '';
  if (row.attributes && typeof row.attributes === 'object') {
    const a = row.attributes;
    return (a.name || a.slug || '').trim() || `#${row.id}`;
  }
  return (row.name || row.slug || '').trim() || `#${row.id}`;
}

function tagRowSlug(row) {
  if (!row || typeof row !== 'object') return '';
  if (row.attributes && typeof row.attributes === 'object') {
    return (row.attributes.slug || '').trim().toLowerCase();
  }
  return (row.slug || '').trim().toLowerCase();
}

const TagMultiSelectInput = ({
  name,
  value,
  onChange,
  intlLabel,
  disabled,
  error,
  description,
  required,
}) => {
  const { formatMessage } = useIntl();
  const { get } = useFetchClient();
  const { modifiedData, initialData } = useCMEditViewDataManager();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const valueIds = useMemo(() => parseStoredIds(value), [value]);
  const relationIds = useMemo(() => idsFromRelationField(modifiedData.tags), [modifiedData.tags]);
  const selectedIds = valueIds.length > 0 ? valueIds : relationIds;

  /** Đã hydrate picker từ initialData.tags cho cặp (entry + updatedAt) — không ghi đè khi user xóa hết. */
  const hydrateTokenRef = useRef(null);

  const setIds = useCallback(
    (ids) => {
      const uniq = [...new Set(ids)];
      const next = uniq.length ? uniq.join(',') : '';
      onChange({ target: { name, type: 'text', value: next } });
    },
    [name, onChange],
  );

  /**
   * Bài cũ chưa có tag_multiselect: copy một lần từ initialData.tags khi CM đã nạp bản ghi.
   */
  useEffect(() => {
    if (disabled) return;
    if (parseStoredIds(value).length > 0) return;

    const fromInitial = idsFromRelationField(initialData.tags);
    if (fromInitial.length === 0) return;

    const token = `${modifiedData.id ?? 'create'}:${initialData.updatedAt ?? initialData.createdAt ?? ''}`;
    if (hydrateTokenRef.current === token) return;
    hydrateTokenRef.current = token;
    setIds(fromInitial);
  }, [
    disabled,
    modifiedData.id,
    value,
    initialData.tags,
    initialData.updatedAt,
    initialData.createdAt,
    setIds,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data } = await get('/content-manager/collection-types/api::tag.tag', {
          params: {
            page: 1,
            pageSize: 500,
            sort: 'name:ASC',
          },
        });
        if (cancelled) return;
        const rows = data?.results ?? data?.data ?? [];
        setOptions(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e);
          setOptions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [get]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (ev) => {
      if (rootRef.current && !rootRef.current.contains(ev.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const idToRow = useMemo(() => {
    const m = new Map();
    for (const row of options) {
      if (row && row.id != null) m.set(Number(row.id), row);
    }
    return m;
  }, [options]);

  const selectedRows = useMemo(
    () => selectedIds.map((id) => idToRow.get(id)).filter(Boolean),
    [selectedIds, idToRow],
  );

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((row) => {
      const label = tagRowLabel(row).toLowerCase();
      const slug = tagRowSlug(row);
      return label.includes(q) || slug.includes(q);
    });
  }, [options, query]);

  const toggleId = (id) => {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setIds(Array.from(s));
  };

  const removeId = (id) => {
    setIds(selectedIds.filter((x) => x !== id));
  };

  const hint = description?.id
    ? formatMessage(description)
    : typeof description === 'string'
      ? description
      : null;

  return (
    <Field name={name} error={error} hint={hint} required={required}>
      <Flex direction="column" alignItems="stretch" gap={1}>
        <FieldLabel>
          {intlLabel?.id
            ? formatMessage(intlLabel)
            : intlLabel?.defaultMessage || 'Tags'}
        </FieldLabel>
        <Box position="relative" ref={rootRef}>
          <Flex
            alignItems="center"
            gap={2}
            padding={2}
            hasRadius
            background="neutral0"
            borderColor={open ? 'primary600' : 'neutral200'}
            borderStyle="solid"
            borderWidth="1px"
            cursor={disabled ? 'not-allowed' : 'text'}
            onClick={() => {
              if (!disabled) {
                setOpen(true);
                inputRef.current?.focus();
              }
            }}
          >
            <Flex wrap="wrap" gap={1} flex={1} alignItems="center">
              {selectedRows.map((row) => (
                <Flex
                  key={row.id}
                  gap={1}
                  paddingTop={1}
                  paddingBottom={1}
                  paddingLeft={2}
                  paddingRight={1}
                  hasRadius
                  background="neutral100"
                  alignItems="center"
                >
                  <Typography variant="pi" fontWeight="semiBold">
                    {tagRowLabel(row)}
                  </Typography>
                  <IconButton
                    label="Remove"
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeId(Number(row.id));
                    }}
                    icon={<Cross width="0.75rem" height="0.75rem" />}
                    noBorder
                  />
                </Flex>
              ))}
              <input
                ref={inputRef}
                disabled={disabled}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setOpen(true)}
                placeholder={
                  selectedRows.length
                    ? formatMessage({
                        id: 'article-tag-picker.search-more',
                        defaultMessage: 'Tìm thêm tag…',
                      })
                    : formatMessage({
                        id: 'article-tag-picker.search',
                        defaultMessage: 'Tìm tag…',
                      })
                }
                style={{
                  flex: 1,
                  minWidth: 120,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.875rem',
                }}
              />
            </Flex>
            <Search width="1rem" height="1rem" aria-hidden />
          </Flex>

          {open && !disabled ? (
            <Box
              position="absolute"
              zIndex={3}
              top="calc(100% + 4px)"
              left={0}
              right={0}
              maxHeight="260px"
              overflow="auto"
              hasRadius
              shadow="filterShadow"
              background="neutral0"
              borderColor="neutral200"
              borderStyle="solid"
              borderWidth="1px"
              paddingTop={1}
              paddingBottom={1}
            >
              {loading ? (
                <Flex justifyContent="center" padding={4} gap={2} alignItems="center">
                  <Spinner width="1.25rem" height="1.25rem" />
                  <Typography variant="pi" textColor="neutral600">
                    {formatMessage({ id: 'article-tag-picker.loading', defaultMessage: 'Đang tải…' })}
                  </Typography>
                </Flex>
              ) : loadError ? (
                <Typography padding={3} textColor="danger600" variant="pi">
                  {formatMessage({
                    id: 'article-tag-picker.load-error',
                    defaultMessage: 'Không tải được danh sách tag.',
                  })}
                </Typography>
              ) : filteredOptions.length === 0 ? (
                <Typography padding={3} textColor="neutral600" variant="pi">
                  {formatMessage({
                    id: 'article-tag-picker.empty',
                    defaultMessage: 'Không có tag khớp.',
                  })}
                </Typography>
              ) : (
                filteredOptions.map((row) => {
                  const id = Number(row.id);
                  const selected = selectedIds.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleId(id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '8px 12px',
                        border: 'none',
                        cursor: 'pointer',
                        background: selected ? 'var(--primary100, #eaf5ff)' : 'transparent',
                        font: 'inherit',
                        textAlign: 'left',
                      }}
                    >
                      <Typography variant="pi" fontWeight={selected ? 'bold' : 'regular'}>
                        {tagRowLabel(row)}
                      </Typography>
                      {selected ? <Check width="1rem" height="1rem" /> : <span style={{ width: '1rem' }} />}
                    </button>
                  );
                })
              )}
            </Box>
          ) : null}
        </Box>
        {hint ? <FieldHint /> : null}
        <FieldError />
      </Flex>
    </Field>
  );
};

TagMultiSelectInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  intlLabel: PropTypes.object,
  disabled: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  description: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  required: PropTypes.bool,
};

export default TagMultiSelectInput;
