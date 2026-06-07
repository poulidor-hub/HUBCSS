"""
Generic badge search match-fields helpers.

Drop this module into any FastAPI app to implement the server-side
logic for the HUBCSS badge search system (SearchBadgeBar component).

Usage:
    from match_fields import compute_match_fields, compute_match_fields_map, apply_exclude_filter

    # 1. Define which fields to scan
    MY_MATCH_FIELDS = [
        ("hostname", "hostname"),
        ("brand", "brand"),
        ("model", "model"),
        ("serial_number", "serial_number"),
    ]

    # 2. In your CRUD list function:
    def list_items(session, search=None, exclude_fields=None, ...):
        # SQL query with search WHERE clause
        ...
        # Compute match fields
        mf_map = compute_match_fields_map(items, search, MY_MATCH_FIELDS)
        # Apply exclusion
        filtered, total, mf_map = apply_exclude_filter(
            all_items, search, exclude_fields, MY_MATCH_FIELDS, offset, limit
        )
        ...
        # Attach match_fields to each item in the API response
        for item in items:
            item.match_fields = mf_map.get(item.id)
"""

from typing import Optional, List, Dict, Tuple, Any, Callable

# A match-field config entry: (badge_name, attribute_name)
# or (badge_name, attribute_name, extra_key_if_different)
MatchFieldConfig = List[Tuple[str, str]]


def compute_match_fields(
    entity: Any,
    search: str,
    match_fields: MatchFieldConfig,
    extra_fields: Optional[Dict[str, str]] = None,
) -> List[str]:
    """Return list of field badge_names where *search* was found in *entity*.

    Tests each field in *match_fields* individually via `getattr(entity, attr)`.
    For joined/calculated fields, pass a dict of {badge_name: value} in *extra_fields*.

    Args:
        entity: The ORM model instance (or dict-like with getattr).
        search: The search term.
        match_fields: List of (badge_name, attribute_name) tuples.
        extra_fields: Optional dict of {badge_name: string_value} for computed fields.

    Returns:
        List of badge_name strings that matched.
    """
    if not search:
        return []
    term = search.lower()
    matched: List[str] = []

    for badge_name, attr in match_fields:
        try:
            value = getattr(entity, attr, None)
        except AttributeError:
            continue
        if value is not None and term in str(value).lower():
            matched.append(badge_name)

    if extra_fields:
        for badge_name, value in extra_fields.items():
            if badge_name not in matched and value and term in str(value).lower():
                matched.append(badge_name)

    return matched


def _row_to_entity(row: Any) -> Any:
    """Extract the ORM entity from a joined SQLAlchemy Row tuple."""
    if isinstance(row, tuple):
        return row[0]
    return row


def _extract_id(entity: Any) -> int:
    """Extract the primary key id from an entity."""
    return entity.id if hasattr(entity, 'id') else id(entity)


def compute_match_fields_map(
    rows: List[Any],
    search: Optional[str],
    match_fields_config: MatchFieldConfig,
    extra_fields_fn: Optional[Callable[[Any], Dict[str, str]]] = None,
) -> Dict[int, List[str]]:
    """Build a dict {entity_id: [matched_badge_names]} for a page of results.

    Args:
        rows: List of ORM entities or SQLAlchemy Row tuples.
        search: The search term (None/empty = empty dict returned).
        match_fields_config: List of (badge_name, attribute_name) tuples.
        extra_fields_fn: Optional callable(row) -> {badge_name: value} for
            joined/calculated fields (e.g. assigned user name from a join).

    Returns:
        Dict mapping entity id to list of matched field names.
    """
    if not search:
        return {}

    result = {}
    for row in rows:
        entity = _row_to_entity(row)
        entity_id = _extract_id(entity)
        extra = extra_fields_fn(row) if extra_fields_fn else None
        result[entity_id] = compute_match_fields(entity, search, match_fields_config, extra)

    return result


def apply_exclude_filter(
    all_rows: List[Any],
    search: Optional[str],
    exclude_fields: Optional[List[str]],
    match_fields_config: MatchFieldConfig,
    offset: int = 0,
    limit: Optional[int] = None,
    extra_fields_fn: Optional[Callable[[Any], Dict[str, str]]] = None,
) -> Tuple[List[Any], int, Dict[int, List[str]]]:
    """Apply server-side field exclusion and repaginate.

    When exclude_fields is active, ALL matching rows must be fetched so
    we can filter in Python and repaginate with correct totals.

    Args:
        all_rows: ALL rows matching the SQL search (no pagination).
        search: The search term.
        exclude_fields: List of badge_names to exclude. None/empty = no exclusion.
        match_fields_config: List of (badge_name, attribute_name) tuples.
        offset: Pagination offset (0-based).
        limit: Page size. None = return all.
        extra_fields_fn: Optional callable(row) -> {badge_name: value}.

    Returns:
        Tuple of (paginated_rows, total_count, match_fields_map).
    """
    if not search or not exclude_fields:
        mf_map = compute_match_fields_map(all_rows, search, match_fields_config, extra_fields_fn)
        total = len(all_rows)
        sliced = all_rows[offset:offset + limit] if limit is not None else all_rows
        # Recompute map only for sliced rows
        mf_map_sliced = {_extract_id(_row_to_entity(r)): mf_map.get(_extract_id(_row_to_entity(r)))
                         for r in sliced}
        return sliced, total, mf_map_sliced

    # Compute match_fields for ALL rows
    mf_map_all = compute_match_fields_map(all_rows, search, match_fields_config, extra_fields_fn)
    exclude_set = set(exclude_fields)

    # Keep rows where at least one matched field is not excluded.
    # Rows with no match_fields are always kept (fallback match like search_text).
    filtered_rows = [
        row for row in all_rows
        if not mf_map_all.get(_extract_id(_row_to_entity(row)))
        or any(f not in exclude_set for f in mf_map_all[_extract_id(_row_to_entity(row))])
    ]

    total = len(filtered_rows)
    sliced = filtered_rows[offset:offset + limit] if limit is not None else filtered_rows
    mf_map_sliced = {_extract_id(_row_to_entity(r)): mf_map_all.get(_extract_id(_row_to_entity(r)))
                     for r in sliced}

    return sliced, total, mf_map_sliced
