export type Option = {
  value: string;
  label: string;
};

export type Subset<K> = {
  [attr in keyof K]?: K[attr] extends object ? Subset<K[attr]> : K[attr]
}

export type FormImage = {
  url: string
  name?: string
  size?: number
  nativeFile?: File
}