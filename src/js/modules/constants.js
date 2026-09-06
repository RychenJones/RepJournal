// RepJournal — shared constants
// Central place for validation limits and other cross-page config.
// A rule change (e.g. raising the name limit) only has to happen
// here, even though multiple pages enforce it.

export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 50;

export const USERNAME_MIN_LENGTH = 1;
export const USERNAME_MAX_LENGTH = 50;

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 71;