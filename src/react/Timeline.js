import { createElement, useState, useMemo, useCallback } from 'react';
import { EmptyState } from './EmptyState.js';

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

function formatTime(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  var now = new Date();
  var diffMs = now - d;
  var diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Maintenant';
  if (diffMin < 60) return 'Il y a ' + diffMin + ' min';
  var diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return 'Il y a ' + diffHours + ' h';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatTimestamp(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getEventTs(evt) {
  var ts = evt.timestamp || evt.created_at;
  return ts ? new Date(ts).getTime() : 0;
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysAgo(n) {
  var d = new Date(Date.now() - n * 86400000);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/*  Human-readable labels                                              */
/* ------------------------------------------------------------------ */

var ACTION_LABELS = {
  login:                   'Connexion',
  logout:                  'D\xe9connexion',
  access_app:              'Acc\xe8s application',
  create_user:             'Cr\xe9ation utilisateur',
  delete_user:             'Suppression utilisateur',
  update_user:             'Modification utilisateur',
  create_app:              'Cr\xe9ation application',
  delete_app:              'Suppression application',
  update_app:              'Modification application',
  approve_app:             'Approbation',
  reject_app:              'Rejet',
  service_account_login:   'Connexion service',
  message_sent:            'Message envoy\xe9',
  backup_run:              'Sauvegarde',
  backup_restore:          'Restauration',
  profile_create:          'Profil cr\xe9\xe9',
  profile_apply:           'Profil appliqu\xe9',
  role_change:             'Changement de r\xf4le',
  password_reset:          'R\xe9initialisation MDP',
  totp_reset:              'R\xe9initialisation TOTP',
  bulk_operation:          'Op\xe9ration group\xe9e',
  settings_update:         'R\xe9glages modifi\xe9s',
  /* errors */
  error_internal:          'Erreur interne (500)',
  error_authentication:    'Erreur d\u2019authentification',
  error_authorization:     'Erreur d\u2019autorisation',
  error_not_found:         'Page non trouv\xe9e',
  error_validation:        'Erreur de validation',
  error_http_error:        'Erreur HTTP',
};

var TAG_LABELS = {
  info:    'Information',
  action:  'Action',
  danger:  'Erreur',
  success: 'Succ\xe8s',
  warning: 'Attention',
};

/* Alert triangle icon for all errors */
var ICON_ALERT = { path: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01' };

var ACTION_ICONS = {
  login:                   { path: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3' },
  logout:                  { path: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9' },
  access_app:              { path: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3' },
  create_user:             { path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6' },
  delete_user:             { path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 6l-6 6M17 6l6 6' },
  update_user:             { path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 2l4 4L12 15H8v-4z' },
  create_app:              { path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6' },
  delete_app:              { path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 15l6-6M15 15l-6-6' },
  update_app:              { path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M17 22l-5-5' },
  approve_app:             { path: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3' },
  reject_app:              ICON_ALERT,
  service_account_login:   { path: 'M12 15l-2 5 9 1.6-2-4.3M15 3H9a3 3 0 0 0-3 3v3M21 8V5a3 3 0 0 0-3-3h-3' },
  message_sent:            { path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  backup_run:              { path: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' },
  backup_restore:          { path: 'M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12' },
  profile_create:          { path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M20 8v6M23 11h-6M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  profile_apply:           { path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M17 2l4 4L12 15H8v-4zM12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  role_change:             { path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM9 12l2 2 4-4' },
  password_reset:          { path: 'M2 17l3-3M6 14l-2-2M11 17l4-4-2-2M17 10l2 2M7 20h10M12 4V2' },
  totp_reset:              { path: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' },
  bulk_operation:          { path: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M16 12l-4 4-4-4M12 8v8' },
  settings_update:         { path: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
  /* error types — all use alert icon */
  error_internal:          ICON_ALERT,
  error_authentication:    ICON_ALERT,
  error_authorization:     ICON_ALERT,
  error_not_found:         ICON_ALERT,
  error_validation:        ICON_ALERT,
  error_http_error:        ICON_ALERT,
};

var ICON_DEFAULT = { path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2' };

function actionIconSvg(action) {
  var icon = ACTION_ICONS[action] || ICON_DEFAULT;
  return createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    createElement('path', { d: icon.path }),
  );
}

function actionLabel(action) {
  return ACTION_LABELS[action] || action || '';
}

function tagLabel(tag) {
  return TAG_LABELS[tag] || tag || '';
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

var DOT_VARIANTS = {
  default: '',
  muted:   'hub-timeline-dot--muted',
  accent:  'hub-timeline-dot--accent',
  danger:  'hub-timeline-dot--danger',
  success: 'hub-timeline-dot--success',
  warning: 'hub-timeline-dot--warning',
};

var TAG_VARIANTS = {
  info:    'hub-timeline-tag--info',
  action:  'hub-timeline-tag--action',
  danger:  'hub-timeline-tag--danger',
  success: 'hub-timeline-tag--success',
  warning: 'hub-timeline-tag--warning',
};

/* ================================================================== */
/*  Vertical Timeline  (backward-compatible)                           */
/* ================================================================== */

function TimelineVertical(_a) {
  var events = _a.events, emptyText = _a.emptyText, className = _a.className;
  if (!events || !events.length) {
    return createElement(
      'div',
      { className: ('hub-empty-state ' + (className || '')).trim() },
      createElement('p', { className: 'hub-empty-state-description' }, emptyText || 'Aucun \u00e9v\u00e9nement'),
    );
  }

  return createElement(
    'div',
    { className: ('hub-timeline ' + (className || '')).trim() },
    events.map(function (evt, i) {
      return createElement(
        'div',
        { className: 'hub-timeline-event', key: evt.id || i, style: { animationDelay: (i * 50) + 'ms' } },
        createElement('div', {
          className: ('hub-timeline-dot ' + (DOT_VARIANTS[evt.dot] || '')).trim(),
        }),
        createElement(
          'div',
          { className: 'hub-timeline-time' },
          createElement('span', null, formatTime(evt.timestamp)),
          evt.tag &&
            createElement('span', {
              className: ('hub-timeline-tag ' + (TAG_VARIANTS[evt.tag] || TAG_VARIANTS.info)).trim(),
            }, evt.tag),
        ),
        evt.title &&
          createElement('p', { className: 'hub-timeline-title' }, evt.title),
        evt.description &&
          createElement('p', { className: 'hub-timeline-description' }, evt.description),
      );
    }),
  );
}

/* ================================================================== */
/*  Horizontal Track  (internal sub-component)                         */
/* ================================================================== */

function TimelineTrack(_a) {
  var events = _a.events, tMin = _a.tMin, tMax = _a.tMax,
      selectedEventId = _a.selectedEventId, onSelectEvent = _a.onSelectEvent;

  var span = (tMax - tMin) || 1;
  var spanHours = span / 3600000;

  function timeLabel(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (spanHours < 2) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    if (spanHours < 48) {
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) +
             ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    var now = new Date();
    var diff = now - d;
    var days = Math.floor(diff / 86400000);
    if (days < 1) return 'Aujourd\u2019hui';
    if (days < 2) return 'Hier';
    if (days < 7) return 'Il y a ' + days + ' j';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  var scalePositions = spanHours < 3 ? [0, 0.5, 1] : [0, 0.33, 0.67, 1];
  var scaleLabels = scalePositions.map(function (p) {
    return { pct: p, label: timeLabel(new Date(tMin + span * p).toISOString()) };
  });

  var ticks = [];
  for (var i = 0; i <= 6; i++) ticks.push(i / 6);

  function dotLeft(evt) {
    return ((getEventTs(evt) - tMin) / span) * 100;
  }

  var todayPct = null;
  var now = Date.now();
  if (now >= tMin && now <= tMax) {
    todayPct = ((now - tMin) / span) * 100;
  }

  function dotLabel(evt) {
    var user = evt.username || '';
    return actionLabel(evt.action) + (user ? ' \u2014 ' + user : '');
  }

  return createElement(
    'div',
    { className: 'hub-timeline-h-track-wrapper' },

    createElement(
      'div',
      { className: 'hub-timeline-h-scale' },
      scaleLabels.map(function (sl) {
        return createElement('span', {
          key: 'lbl-' + sl.pct,
          className: 'hub-timeline-h-scale-label',
          style: { left: (sl.pct * 100) + '%' },
        }, sl.label);
      }),
    ),

    createElement(
      'div',
      { className: 'hub-timeline-h-track' },
      createElement(
        'div',
        { className: 'hub-timeline-h-line' },

        todayPct !== null && createElement('div', {
          className: 'hub-timeline-h-today-marker',
          style: { left: todayPct.toFixed(2) + '%' },
        }, createElement('span', null, 'Aujourd\u2019hui')),

        ticks.map(function (pct, idx) {
          return createElement('div', {
            key: 'tick-' + idx,
            className: 'hub-timeline-h-tick hub-timeline-h-tick--major',
            style: { left: (pct * 100) + '%' },
          });
        }),

        events.map(function (evt) {
          var pos = dotLeft(evt);
          var evtId = evt.id || evt.timestamp || evt.created_at;
          var isSel = String(evtId) === String(selectedEventId);
          var dotClass = DOT_VARIANTS[evt.dot] || DOT_VARIANTS.default;

          return createElement('button', {
            key: evt.id || (evt.timestamp || evt.created_at) + '-' + evt.action,
            type: 'button',
            className: 'hub-timeline-h-dot ' + dotClass + (isSel ? ' hub-timeline-h-dot--selected' : ''),
            style: { left: pos.toFixed(2) + '%' },
            onClick: function () { return onSelectEvent && onSelectEvent(evt); },
            title: dotLabel(evt),
          });
        }),
      ),
    ),
  );
}

/* ================================================================== */
/*  Horizontal Timeline                                                */
/* ================================================================== */

function TimelineHorizontal(_a) {
  var events              = _a.events;
  var emptyText           = _a.emptyText;
  var className           = _a.className;
  var startDate           = _a.startDate;
  var endDate             = _a.endDate;
  var onDateRangeChange   = _a.onDateRangeChange;
  var selectedEventId     = _a.selectedEventId;
  var onSelectEvent       = _a.onSelectEvent;
  var showAdvFilters      = _a.showAdvancedFilters;
  var onToggleAdvFilters  = _a.onToggleAdvancedFilters;
  var actionFiltersControlled = _a.actionFilters;
  var onActionFiltersChange   = _a.onActionFiltersChange;
  var allActionTypes      = _a.allActionTypes;
  var children            = _a.children;
  var filterSelect        = _a.filterSelect;

  /* ---- derived state ---- */
  var _a2 = useState(new Set()), internalActionFilters = _a2[0], setInternalActionFilters = _a2[1];
  var _b = useState(false), internalAdvFilters = _b[0], setInternalAdvFilters = _b[1];
  var _c = useState(startDate || ''), internalStart = _c[0], setInternalStart = _c[1];
  var _d = useState(endDate || ''), internalEnd = _d[0], setInternalEnd = _d[1];
  var actionFilters = actionFiltersControlled !== undefined ? actionFiltersControlled : internalActionFilters;
  var showAdvancedFilters = showAdvFilters !== undefined ? showAdvFilters : internalAdvFilters;
  var sDate = startDate !== undefined ? startDate : internalStart;
  var eDate = endDate !== undefined ? endDate : internalEnd;

  var safeEvents = events || [];

  /* ---- action type discovery ---- */
  var actionTypes = useMemo(function () {
    if (allActionTypes) return allActionTypes;
    var seen = {};
    var out = [];
    for (var i = 0; i < safeEvents.length; i++) {
      var a = safeEvents[i].action;
      if (a && !seen[a]) {
        seen[a] = true;
        out.push({ key: a, label: actionLabel(a) });
      }
    }
    return out;
  }, [safeEvents, allActionTypes]);

  /* ---- filtered events ---- */
  var filteredEvents = useMemo(function () {
    var evts = safeEvents;
    if (actionFilters.size > 0) {
      evts = evts.filter(function (e) { return actionFilters.has(e.action); });
    }
    return evts;
  }, [safeEvents, actionFilters]);

  /* ---- time scale ---- */
  var timeBounds = useMemo(function () {
    if (filteredEvents.length === 0) return null;
    var min = Infinity, max = -Infinity;
    for (var i = 0; i < filteredEvents.length; i++) {
      var t = getEventTs(filteredEvents[i]);
      if (t < min) min = t;
      if (t > max) max = t;
    }
    if (min === Infinity) return null;
    if (min === max) { min -= 60000; max += 60000; }
    return { min: min, max: max };
  }, [filteredEvents]);

  /* ---- selected event ---- */
  var navIndex = -1;
  if (selectedEventId != null) {
    for (var ni = 0; ni < filteredEvents.length; ni++) {
      var evtId = filteredEvents[ni].id || filteredEvents[ni].timestamp || filteredEvents[ni].created_at;
      if (String(evtId) === String(selectedEventId)) { navIndex = ni; break; }
    }
  }
  var selectedEvent = navIndex >= 0 ? filteredEvents[navIndex] : null;

  var filterCount = actionFilters.size;

  /* ---- max date constraint (30 days) ---- */
  var maxStart = useMemo(function () {
    if (!eDate) return '';
    var d = new Date(eDate);
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  }, [eDate]);

  var minEnd = useMemo(function () {
    if (!sDate) return '';
    var d = new Date(sDate);
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, [sDate]);

  /* ---- handlers ---- */
  var handleToggleActionFilter = useCallback(function (actionKey) {
    var next = new Set(actionFilters);
    if (next.has(actionKey)) next.delete(actionKey); else next.add(actionKey);
    setInternalActionFilters(next);
    if (onActionFiltersChange) onActionFiltersChange(next);
  }, [actionFilters, onActionFiltersChange]);

  var handleStartChange = useCallback(function (e) {
    var v = e.target.value;
    setInternalStart(v);
    if (onDateRangeChange) onDateRangeChange(v, eDate);
  }, [eDate, onDateRangeChange]);

  var handleEndChange = useCallback(function (e) {
    var v = e.target.value;
    setInternalEnd(v);
    if (onDateRangeChange) onDateRangeChange(sDate, v);
  }, [sDate, onDateRangeChange]);

  var handleSelectEvent = useCallback(function (evt) {
    if (onSelectEvent) onSelectEvent(evt);
  }, [onSelectEvent]);

  var handleNav = useCallback(function (dir) {
    if (!onSelectEvent || navIndex < 0) return;
    var newIdx = navIndex + (dir === 'next' ? 1 : -1);
    if (newIdx >= 0 && newIdx < filteredEvents.length) {
      onSelectEvent(filteredEvents[newIdx]);
    }
  }, [navIndex, filteredEvents, onSelectEvent]);

  var toggleAdv = useCallback(function () {
    var next = !showAdvancedFilters;
    setInternalAdvFilters(next);
    if (onToggleAdvFilters) onToggleAdvFilters(next);
  }, [showAdvancedFilters, onToggleAdvFilters]);

  /* ---- render ---- */
  return createElement(
    'div',
    { className: ('hub-timeline-h ' + (className || '')).trim() },

    /* ======== TOOLBAR ======== */
    createElement(
      'div',
      { className: 'hub-timeline-h-toolbar' },

      /* date range: Du [date] Au [date] */
      createElement('div', { className: 'hub-timeline-h-dates' },
        createElement('label', { className: 'hub-timeline-h-date-label' }, 'Du'),
        createElement('input', {
          type: 'date',
          className: 'hub-timeline-h-date-input',
          value: sDate,
          max: eDate || undefined,
          min: maxStart || undefined,
          onChange: handleStartChange,
        }),
        createElement('label', { className: 'hub-timeline-h-date-label' }, 'Au'),
        createElement('input', {
          type: 'date',
          className: 'hub-timeline-h-date-input',
          value: eDate,
          max: isoToday(),
          min: minEnd || sDate || undefined,
          onChange: handleEndChange,
        }),
      ),

      /* filter select (app / user) */
      filterSelect && createElement('select', {
        className: 'hub-timeline-h-filter-select',
        value: filterSelect.value || '',
        onChange: function (e) { filterSelect.onChange(e.target.value); },
      },
        createElement('option', { value: '' }, filterSelect.placeholder || 'Tous'),
        filterSelect.options.map(function (opt) {
          return createElement('option', { key: opt.value, value: opt.value }, opt.label);
        }),
      ),

      /* advanced filters toggle */
      createElement('button', {
        type: 'button',
        className: 'hub-timeline-h-filters-toggle' +
          (showAdvancedFilters ? ' hub-timeline-h-filters-toggle--active' : ''),
        onClick: toggleAdv,
        title: 'Filtres avanc\u00e9s',
      },
        createElement('svg', {
          width: 14, height: 14, viewBox: '0 0 24 24',
          fill: 'none', stroke: 'currentColor', strokeWidth: 2,
        },
          createElement('path', { d: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6' }),
        ),
        createElement('span', null, 'Filtres'),
        filterCount > 0 && createElement('span', { className: 'hub-timeline-h-filters-badge' }, '' + filterCount),
      ),
    ),

    /* ======== ADVANCED FILTERS PANEL ======== */
    showAdvancedFilters && createElement(
      'div',
      { className: 'hub-timeline-h-filters-panel' },

      actionTypes.length > 0 && createElement(
        'div',
        { className: 'hub-timeline-h-action-filters' },
        createElement('span', { className: 'hub-timeline-h-action-filters-label' }, 'Types d\u2019action\u00a0:'),
        actionTypes.map(function (at) {
          var active = actionFilters.has(at.key);
          return createElement('button', {
            key: at.key,
            type: 'button',
            className: 'hub-timeline-h-action-chip' +
              (active ? ' hub-timeline-h-action-chip--active' : ''),
            onClick: function () { handleToggleActionFilter(at.key); },
          }, at.label);
        }),
      ),
    ),

    /* ======== TRACK or EMPTY ======== */
    filteredEvents.length === 0
      ? createElement(EmptyState, {
          description: emptyText || 'Aucun \u00e9v\u00e9nement trouv\u00e9',
        })
      : createElement(TimelineTrack, {
          events: filteredEvents,
          tMin: timeBounds ? timeBounds.min : 0,
          tMax: timeBounds ? timeBounds.max : 0,
          selectedEventId: selectedEventId,
          onSelectEvent: handleSelectEvent,
        }),

    /* ======== DETAIL PANEL ======== */
    selectedEvent && createElement(
      'div',
      { className: 'hub-timeline-h-detail hub-timeline-h-detail--' + (selectedEvent.dot || 'muted') },

      /* header: icon + title + nav */
      createElement(
        'div',
        { className: 'hub-timeline-h-detail-header' },
        createElement('div', { className: 'hub-timeline-h-detail-header-left' },
          createElement('span', { className: 'hub-timeline-h-detail-icon' },
            actionIconSvg(selectedEvent.action),
          ),
          createElement('h4', { className: 'hub-timeline-h-detail-title' },
            selectedEvent.title || actionLabel(selectedEvent.action) || ''),
        ),
        createElement('div', { className: 'hub-timeline-h-detail-nav' },
          createElement('button', {
            type: 'button',
            className: 'hub-timeline-h-nav-btn',
            disabled: navIndex >= filteredEvents.length - 1,
            onClick: function () { handleNav('next'); },
            title: 'Plus r\u00e9cent',
          }, '\u2190'),
          createElement('span', { className: 'hub-timeline-h-nav-pos' },
            (filteredEvents.length - navIndex) + '\u00a0/\u00a0' + filteredEvents.length),
          createElement('button', {
            type: 'button',
            className: 'hub-timeline-h-nav-btn',
            disabled: navIndex <= 0,
            onClick: function () { handleNav('prev'); },
            title: 'Plus ancien',
          }, '\u2192'),
        ),
      ),

      /* body: labeled rows */
      createElement(
        'div',
        { className: 'hub-timeline-h-detail-body' },

        createElement('div', { className: 'hub-timeline-h-detail-row' },
          createElement('span', { className: 'hub-timeline-h-detail-label' }, 'Date'),
          createElement('span', { className: 'hub-timeline-h-detail-value' },
            formatTimestamp(selectedEvent.timestamp || selectedEvent.created_at),
          ),
        ),

        createElement('div', { className: 'hub-timeline-h-detail-row' },
          createElement('span', { className: 'hub-timeline-h-detail-label' }, 'Action'),
          createElement('span', { className: 'hub-timeline-h-detail-value' },
            actionLabel(selectedEvent.action),
            selectedEvent.tag && createElement('span', {
              className: 'hub-timeline-h-detail-tag ' + (TAG_VARIANTS[selectedEvent.tag] || TAG_VARIANTS.info),
            }, tagLabel(selectedEvent.tag)),
          ),
        ),

        selectedEvent.username && createElement('div', { className: 'hub-timeline-h-detail-row' },
          createElement('span', { className: 'hub-timeline-h-detail-label' }, 'Utilisateur'),
          createElement('span', { className: 'hub-timeline-h-detail-value hub-timeline-h-detail-user' },
            selectedEvent.username,
          ),
        ),

        selectedEvent.app_slug && createElement('div', { className: 'hub-timeline-h-detail-row' },
          createElement('span', { className: 'hub-timeline-h-detail-label' }, 'Application'),
          createElement('span', { className: 'hub-timeline-h-detail-value' }, selectedEvent.app_slug),
        ),

        selectedEvent.description && createElement('div', { className: 'hub-timeline-h-detail-row' },
          createElement('span', { className: 'hub-timeline-h-detail-label' }, 'D\u00e9tails'),
          createElement('span', { className: 'hub-timeline-h-detail-value hub-timeline-h-detail-desc' },
            selectedEvent.description),
        ),

        children,
      ),
    ),
  );
}

/* ================================================================== */
/*  Main Export                                                        */
/* ================================================================== */

export function Timeline(props) {
  if (props.mode === 'horizontal') {
    return createElement(TimelineHorizontal, props);
  }
  return createElement(TimelineVertical, props);
}

export default Timeline;
