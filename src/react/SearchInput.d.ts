export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (term: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  autoFocus?: boolean;
  clearable?: boolean;
}

export declare const SearchInput: (props: SearchInputProps) => import('react').ReactElement;
export default SearchInput;
