import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

const flattenOptions = (children, optionsProp) => {
  if (Array.isArray(optionsProp)) {
    return optionsProp.map((item) => {
      if (item && typeof item === 'object') {
        const val = item.value !== undefined ? item.value : (item.id !== undefined ? item.id : item.label);
        return {
          value: val !== undefined ? String(val) : '',
          label: String(item.label ?? val ?? ''),
          disabled: Boolean(item.disabled)
        };
      }
      return { value: String(item ?? ''), label: String(item ?? ''), disabled: false };
    });
  }

  const parsed = [];
  const walk = (nodes) => {
    React.Children.forEach(nodes, (child) => {
      if (!child) return;
      if (Array.isArray(child)) {
        walk(child);
        return;
      }
      if (child.type === React.Fragment && child.props?.children) {
        walk(child.props.children);
        return;
      }
      if (child.type === 'option') {
        const rawVal = child.props?.value !== undefined ? child.props.value : child.props?.children;
        const labelText = Array.isArray(child.props?.children)
          ? child.props.children.map(c => (c == null || typeof c === 'boolean' ? '' : String(c))).join('')
          : String(child.props?.children ?? rawVal ?? '');
        parsed.push({
          value: rawVal !== undefined && rawVal !== null ? String(rawVal) : '',
          label: labelText,
          disabled: Boolean(child.props?.disabled)
        });
      }
    });
  };
  walk(children);
  return parsed;
};

export const SearchableSelect = ({
  id,
  value,
  onChange,
  children,
  options: optionsProp,
  className = 'form-select',
  style = {},
  disabled = false,
  placeholder = '-- Select --',
  searchPlaceholder = 'Type to search...',
  'aria-label': ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [menuStyle, setMenuStyle] = useState(null);

  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);

  const allOptions = useMemo(() => flattenOptions(children, optionsProp), [children, optionsProp]);
  const stringVal = value !== undefined && value !== null ? String(value) : '';

  const selectedOption = useMemo(
    () => allOptions.find(opt => opt.value === stringVal) || allOptions[0] || null,
    [allOptions, stringVal]
  );

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter(opt =>
      opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [allOptions, query]);

  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estHeight = 290;
    const openUpward = spaceBelow < estHeight && spaceAbove > spaceBelow;
    const width = Math.max(rect.width, 230);
    const maxW = Math.min(480, window.innerWidth - 16);
    const finalWidth = Math.min(width, maxW);
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - finalWidth - 8);

    setMenuStyle({
      position: 'fixed',
      left: `${left}px`,
      width: `${finalWidth}px`,
      top: openUpward ? 'auto' : `${rect.bottom + 4}px`,
      bottom: openUpward ? `${window.innerHeight - rect.top + 4}px` : 'auto',
      zIndex: 9999
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    computePosition();
    const raf = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    const handleDocMouseDown = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        (!menuRef.current || !menuRef.current.contains(e.target))
      ) {
        setIsOpen(false);
        setQuery('');
      }
    };

    const handleScrollOrResize = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      computePosition();
    };

    document.addEventListener('mousedown', handleDocMouseDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', handleDocMouseDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, computePosition]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [query, isOpen]);

  const commitSelection = (opt) => {
    if (!opt || opt.disabled || disabled) return;
    setIsOpen(false);
    setQuery('');
    if (onChange) {
      onChange({ target: { value: opt.value } });
    }
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Enter' && !isOpen) {
      // Allow parent forms (like Step2Medical handleFormKeyDown) or toggle when Shift/Alt not pressed
      if (!e.defaultPrevented) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setQuery('');
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => (filteredOptions.length ? (prev + 1) % filteredOptions.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => (filteredOptions.length ? (prev - 1 + filteredOptions.length) % filteredOptions.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const targetOpt = filteredOptions[highlightIdx] || filteredOptions[0];
      if (targetOpt) commitSelection(targetOpt);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block', width: style?.width || '100%', minWidth: style?.minWidth }}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => {
          if (!disabled) {
            setQuery('');
            setIsOpen(prev => !prev);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`${className} searchable-select-trigger`}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.45rem',
          width: '100%',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundImage: 'none',
          paddingRight: '0.6rem'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          style={{
            flexShrink: 0,
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease'
          }}
        />
      </button>

      {isOpen && menuStyle && (
        <div
          ref={menuRef}
          style={{
            ...menuStyle,
            backgroundColor: 'var(--bg-surface, #FFFFFF)',
            border: '1px solid var(--border-medium, #CBD5E1)',
            borderRadius: '8px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
            overflow: 'hidden'
          }}
        >
          {/* Sticky Search Input */}
          <div style={{
            padding: '0.45rem',
            borderBottom: '1px solid var(--border-light, #E2E8F0)',
            backgroundColor: 'var(--bg-surface-subtle, #F8FAFC)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              className="searchable-select-search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '0.82rem',
                color: 'var(--text-primary)'
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  searchInputRef.current?.focus();
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  padding: '2px'
                }}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div style={{ maxHeight: '235px', overflowY: 'auto', padding: '0.25rem' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No matching options found.
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === stringVal;
                const isHighlighted = idx === highlightIdx;
                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    disabled={opt.disabled}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    onClick={() => commitSelection(opt)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.45rem 0.6rem',
                      border: 'none',
                      borderRadius: '6px',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      backgroundColor: isSelected
                        ? 'var(--brand-primary, #E82329)'
                        : isHighlighted
                          ? 'rgba(37, 99, 235, 0.08)'
                          : 'transparent',
                      color: isSelected
                        ? '#FFFFFF'
                        : opt.disabled
                          ? 'var(--text-muted)'
                          : 'var(--text-primary)'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', lineHeight: 1.3 }}>
                      {opt.label}
                    </span>
                    {isSelected && <Check size={14} style={{ flexShrink: 0 }} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
