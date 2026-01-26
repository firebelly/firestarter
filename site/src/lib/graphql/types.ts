// Base entry fields (all Craft entries have these)
export interface BaseEntry {
  title: string;
  uri: string | null;
}

// Homepage entry (homepage section, homepage entry type)
export interface HomepageEntry extends BaseEntry {
  heading: string | null;
  body: string | null;
}

// Page entry (pages section, page entry type)
export interface PageEntry extends BaseEntry {
  heading: string | null;
  body: string | null;
}

// GraphQL response wrapper
export interface EntryResponse<T> {
  entry: T | null;
}
